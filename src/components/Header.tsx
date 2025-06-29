
import { Zap } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="py-4 px-6 md:px-8 bg-card shadow-md">
      <div className="container mx-auto flex items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <Zap className="h-8 w-8" />
          <h1 className="text-2xl md:text-3xl font-headline font-semibold">
            Vibe Vault
          </h1>
        </Link>
      </div>
    </header>
  );
}
