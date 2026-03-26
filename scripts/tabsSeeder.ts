import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

interface SeedEntry {
  fileName: string;
  title: string;
  artist: string;
  album: string;
  public: boolean;
}

interface UploadResult {
  fileName: string;
  success: boolean;
  message?: string;
  error?: string;
}

const EMAIL = process.env.SEED_USER_EMAIL ?? "";
const PASSWORD = process.env.SEED_USER_PASSWORD ?? "";
const BASE_URL = "http://localhost:3000";
const GP_FILES_DIR = path.resolve(process.cwd(), "public", "gp-files");
const SEED_JSON = path.resolve(process.cwd(), "public", "tab-seeder.json");
const UPLOAD_ENDPOINT = `${BASE_URL}/api/tabs/upload`;

async function authenticate(): Promise<string>{
  console.log(`Authenticating as ${EMAIL}`);
  const supaabase = await createClient();

  const { data, error } = await supaabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });

  if (error) throw new Error(`Authentication failed: ${error.message}`)
  if (!data.session) throw new Error(`No session found`)
  
  return data.session.access_token;
}

async function uploadTab(
  entry: SeedEntry,
  sessionCookie: string
): Promise<UploadResult> {
  const filePath = path.join(GP_FILES_DIR, entry.fileName);

  if (!fs.existsSync(filePath)) {
    return {
      fileName: entry.fileName,
      success: false,
      error: `File not found: ${filePath}`,
    };
  }

  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer]);

  const form = new FormData();
  form.append("file", blob, entry.fileName);
  form.append(
    "fileData",
    JSON.stringify({
      title: entry.title,
      artist: entry.artist,
      album: entry.album,
      is_public: entry.public
    })
  )

  const res = await fetch(UPLOAD_ENDPOINT, {
    method: "POST",
    body: form,
    headers: { Cookie: sessionCookie }
  });

  const json = (await res.json()) as { message?: string; error?: string};

  if (!res.ok) {
    return {
      fileName: entry.fileName,
      success: false,
      error: json.error
    }
  }

  return {
    fileName: entry.fileName,
    success: true,
    message: json.message
  }
}

async function main() {
  if (!fs.existsSync(SEED_JSON)) {
    console.error("Seed file not found", SEED_JSON);
    process.exit(1);
  }

  const sessionCookie = await authenticate();

  const entries: SeedEntry[] = JSON.parse(fs.readFileSync(SEED_JSON, "utf-8"));
  console.log(`Found ${entries.length} entries`);

  const results: UploadResult[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    process.stdout.write(
      `  [${i + 1}/${entries.length}] Uploading "${entry.title}" by ${entry.artist}… `,
    );

    const result = await uploadTab(entry, sessionCookie);
    results.push(result);

    if (result.success) {
      console.log("Done")
    } else {
      console.log(result.error)
    }
  }

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`\n${passed} succeeded, ${failed} failed`);

  if (failed > 0) {
    console.log("\nFailed files:");
    results
      .filter((r) => !r.success)
      .forEach((r) => console.log(`  • ${r.fileName}: ${r.error}`));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unexpected error: ", error);
  process.exit(1);
})