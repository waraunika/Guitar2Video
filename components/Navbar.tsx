import { Suspense } from "react";
import { EnvVarWarning } from "./env-var-warning";
import { AuthButton } from "./auth-button";
import { ThemeSwitcher } from "./theme-switcher";
import { hasEnvVars } from "@/lib/utils";

export default function Navbar() {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
        {/* Left side - warning */}
        <div>
          <svg
            width="200"
            height="100"
            viewBox="0 0 200 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Stylized "Tab" with play button */}
            <text
              x="20"
              y="55"
              fill="#DC2626"
              fontSize="48"
              fontWeight="bold"
              fontFamily="monospace"
            >
              TAB
            </text>

            {/* Play button integrated into the '2' */}
            <circle cx="120" cy="40" r="18" fill="#DC2626" />
            <text
              x="120"
              y="48"
              textAnchor="middle"
              fill="white"
              fontSize="24"
              fontWeight="bold"
            >
              2
            </text>

            {/* Video element */}
            <rect
              x="150"
              y="25"
              width="40"
              height="30"
              rx="5"
              fill="#DC2626"
              fillOpacity="0.2"
              stroke="#DC2626"
              strokeWidth="3"
            />
            <polygon points="160,32 160,48 176,40" fill="#DC2626" />

            {/* Subtext */}
            <text x="20" y="80" fill="#6B7280" fontSize="14">
              guitar tabs to video
            </text>
          </svg>
          {!hasEnvVars ? <EnvVarWarning /> : null}
        </div>

        {/* Right side - Auth buttons and theme switcher */}
        <div className="flex gap-2 items-center">
          {hasEnvVars ? (
            <Suspense>
              <ThemeSwitcher />
              <AuthButton />
            </Suspense>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
