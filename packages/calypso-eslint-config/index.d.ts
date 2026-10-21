import type { Linter } from 'eslint';

/** The repo-wide config for the checkout containing `dir`, the calling config's `import.meta.dirname`. */
export default function calypso( dir: string ): Linter.Config[];

export const browserGlobals: Linter.Globals;
export const nodeConfig: Linter.Config;
export const restrictedImports: Linter.RuleEntry;
