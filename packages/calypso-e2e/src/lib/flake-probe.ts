import type { Page } from 'playwright';

// Throwaway diagnostics for the signup/importer flakes tracked in
// fix/e2e-signup-importer-flake-probes. Emits greppable [FLAKE-PROBE] lines to
// the CI build log. Remove this file and its call sites once the timing/failure
// data has been collected.

const PREFIX = '[FLAKE-PROBE]';

/**
 * Emits a single greppable diagnostic line to stdout (captured in the CI log).
 *
 * Writes via `process.stdout.write` rather than `console.log`: CI runs the Jest
 * package tests with `--silent`, which mutes `console.*`, and a single write
 * keeps the line intact when workers run concurrently.
 */
export function flakeProbe( label: string, data: Record< string, unknown > ): void {
	process.stdout.write( `${ PREFIX } ${ label } ${ JSON.stringify( data ) }\n` );
}

/**
 * Captures cheap page state at a failure point. Never throws and never waits on
 * elements, so it cannot itself hang or mask the original failure.
 */
export async function capturePageState( page: Page ): Promise< Record< string, unknown > > {
	const safe = async < T >( fn: () => Promise< T >, fallback: T ): Promise< T > => {
		try {
			return await fn();
		} catch {
			return fallback;
		}
	};

	return {
		url: page.url(),
		headings: ( await safe( () => page.locator( 'h1, h2' ).allInnerTexts(), [] ) ).slice( 0, 8 ),
		errors: (
			await safe( () => page.locator( '[class*="error"], [role="alert"]' ).allInnerTexts(), [] )
		).slice( 0, 8 ),
	};
}
