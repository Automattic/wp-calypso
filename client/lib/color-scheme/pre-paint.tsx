import { DARK_SEEDS } from './seeds';

export const COLOR_SCHEME_STORAGE_KEY = 'wpcom-color-scheme';

/**
 * Paints the page dark before the app loads when the last color scheme the user saw was dark.
 */
export function ThemePrePaint( { nonce }: { nonce?: string } ) {
	const script = `(function(){try{var s=localStorage.getItem(${ JSON.stringify(
		COLOR_SCHEME_STORAGE_KEY
	) });if(s==='system'){s=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(s==='dark'){document.documentElement.setAttribute('data-pre-paint-theme','dark');}}catch(e){}})();`;
	const style = `html[data-pre-paint-theme="dark"],html[data-pre-paint-theme="dark"] body{background:${ DARK_SEEDS.background };color-scheme:dark;}`;

	return (
		<>
			{ /* eslint-disable-next-line react/no-danger */ }
			<style nonce={ nonce } dangerouslySetInnerHTML={ { __html: style } } />
			{ /* eslint-disable-next-line react/no-danger */ }
			<script nonce={ nonce } dangerouslySetInnerHTML={ { __html: script } } />
		</>
	);
}

/**
 * Removes the pre-paint dark background once the theme provider has applied its tokens.
 */
export function clearPrePaintTheme() {
	delete document.documentElement.dataset.prePaintTheme;
}

/**
 * Returns the color scheme the user last saw, saved by the theme provider, or null.
 */
export function readColorSchemeHint(): string | null {
	try {
		return window.localStorage.getItem( COLOR_SCHEME_STORAGE_KEY );
	} catch {
		return null;
	}
}
