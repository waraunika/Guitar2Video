'use client';

import { useSearchParams } from "next/navigation";
import AlphaTabViewer from "@/components/tabs/AlphaTabViewer";

export default function ViewTabPage() {
  const params = useSearchParams();
  const fileUrl = params.get("url" ) 
    ? decodeURIComponent(params.get("url")!) 
    : null;
  const title = params.get("title") ?? "Tab Viewer";

  return (
    <div className="w-full flex flex-col gap-6">
      <h1 className="text-2xl font-bold w-full">
        {title}
      </h1>

      <AlphaTabViewer
        fileUrl={fileUrl}
        editorModeAvailable={false}
      />
    </div>
  )
}