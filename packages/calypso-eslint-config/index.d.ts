import type { Linter } from 'eslint';

declare const config: Linter.Config[];
export default config;

export const browserGlobals: Linter.Globals;
export const nodeConfig: Linter.Config;
export const restrictedImports: Linter.RuleEntry;
