import AlphaTabViewer from "@/components/AlphaTabViewer";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Navbar />

        <AlphaTabViewer />
      </div>
    </main>
  );
}
