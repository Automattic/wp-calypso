export const COLOR_SCHEME_STORAGE_KEY = 'dashboard-color-scheme';

export const LIGHT_SEEDS = {
	background: '#fcfcfc',
	primary: '#3858e9',
};

export const DARK_SEEDS = {
	background: '#181818',
	primary: '#93aef8',
};

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
