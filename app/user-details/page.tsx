"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { X, Upload, User, SkipForward, Check } from "lucide-react";
import Image from "next/image";

export default function UserDetailsForm() {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
      
      // Load existing profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("bio, avatar_url")
        .eq("id", user.id)
        .single();
      
      if (profile?.bio) {
        setBio(profile.bio);
      }
      
      if (profile?.avatar_url) {
        setAvatarPreview(profile.avatar_url);
      }
    };
    
    getUser();
  }, [supabase, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Avatar must be an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar must be smaller than 2MB");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  };

  const uploadAvatar = async (userId: string, file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatar")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage.from("avatar").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSkip = async () => {
    router.push("/dashboard"); // or wherever you want to redirect
  };

  const handleConfirm = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      let avatarUrl: string | null = null;

      // Upload avatar if changed
      if (avatarFile) {
        avatarUrl = await uploadAvatar(user.id, avatarFile);
        if (!avatarUrl) {
          setError("Failed to upload avatar. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      // Prepare profile updates
      const updates: { bio?: string; avatar_url?: string } = {};
      
      if (bio && bio !== "") {
        updates.bio = bio.slice(0, 256); // Limit to 256 characters
      }
      
      if (avatarUrl) {
        updates.avatar_url = avatarUrl;
      }

      // Update profile if there are changes
      if (Object.keys(updates).length > 0) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          setError("Failed to save profile details. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      // If avatar was uploaded, also update user metadata
      if (avatarUrl) {
        await supabase.auth.updateUser({
          data: { avatar_url: avatarUrl }
        });
      }

      // Redirect to dashboard or home page
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving details:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 relative min-h-screen bg-background">
      <Link
        href="/"
        className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        aria-label="Close and go to home"
      >
        <X className="h-5 w-5" />
      </Link>

      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-4xl fade-in">
          <CardHeader>
            <CardTitle className="text-2xl">Complete your profile</CardTitle>
            <CardDescription>
              Add a profile picture and bio to help others get to know you
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
              <div className="flex flex-col md:flex-row gap-8">
                
                {/* Left Column - Avatar Upload */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center overflow-hidden bg-muted">
                        {avatarPreview ? (
                          <Image
                            src={avatarPreview}
                            alt="Avatar preview"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isLoading}
                          className="w-full"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {avatarFile ? "Change photo" : "Upload photo"}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          JPG, PNG or GIF · max 2MB
                        </p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Right Column - Bio */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us a little about yourself..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 256))}
                      disabled={isLoading}
                      className="min-h-[150px] resize-none"
                      maxLength={256}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Optional</span>
                      <span>{bio.length}/256 characters</span>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-6 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip for now
                </Button>
                <Button
                  type="submit"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Confirm"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}