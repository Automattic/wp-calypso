declare module '*.scss' {
	const content: Record< string, string >;
	export default content;
}

declare module '*.css';

declare module 'browser-filesaver' {
	export function saveAs( data: Blob, filename: string, disableAutoBOM?: boolean ): void;
}

declare module 'is-my-json-valid' {
	export default function ( schema: any, options?: any ): ( data: any ) => boolean;
	export function filter( schema: any, options?: any ): any;
}

/**
 * Minimal types for the `creditcards` package (https://github.com/bendrucker/creditcards),
 * which validates/parses/formats card numbers, CVCs, and expiration dates.
 *
 * The package ships no types and there is no `@types/creditcards`, so importing it from a
 * `.ts` file would otherwise be implicitly `any` (TS7016). These signatures were derived by
 * reading the package source (`card.js`) and intentionally cover only the surface we use
 * today (`card.type`, in `client/lib/checkout/validation.ts`) — extend as needed.
 *
 * `card.type` returns the human brand name (e.g. `'Visa'`, `'American Express'`) or
 * `undefined` if no brand matches. The `eager` flag matches on the shortest distinguishing
 * prefix, so a brand can be identified while the user is still typing.
 */
declare module 'creditcards' {
	interface CreditCards {
		card: {
			type( number: string, eager?: boolean ): string | undefined;
		};
	}
	const creditcards: CreditCards;
	export default creditcards;
}
