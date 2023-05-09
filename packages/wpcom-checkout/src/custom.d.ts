import '@emotion/react';
import type { Theme as CheckoutTheme } from '@automattic/composite-checkout';

declare module '*.svg' {
	const url: string;
	export default url;
}

declare module '@emotion/react' {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	export interface Theme extends CheckoutTheme {}
}
