import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Main Message */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">
              Ready to start your guitar journey?
            </h3>
            <p className="text-muted-foreground max-w-2xl">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                Create an Account
                <ExternalLink className="h-4 w-4"/>
              </Link>{" "}
              and join us for a grand guitar experience. Learn from expert
              musicians, connect with a passionate community, and take your
              skills to the next level.
            </p>
          </div>

          {/* Bottom Links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/" className="hover:underline">
              About
            </Link>
            <Link href="/" className="hover:underline">
              Privacy
            </Link>
            <Link href="/" className="hover:underline">
              Terms
            </Link>
            <Link href="/" className="hover:underline">
              Contact
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Guitar Experience. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
