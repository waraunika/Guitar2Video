import { Suspense } from "react";
import { EnvVarWarning } from "./env-var-warning";
import { AuthButton } from "./auth-button";
import { ThemeSwitcher } from "./theme-switcher";
import { hasEnvVars } from "@/lib/utils";

export default function Navbar() {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        {!hasEnvVars ? (
          <EnvVarWarning />
        ) : (
          <Suspense>
            <AuthButton />
            <ThemeSwitcher />
          </Suspense>
        )}
      </div>
    </nav>
  );
}
