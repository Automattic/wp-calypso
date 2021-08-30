import '@emotion/react';
import type { Theme as CheckoutTheme } from './lib/theme';

declare module '@emotion/react' {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	export interface Theme extends CheckoutTheme {}
}
