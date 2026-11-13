import path from 'path';

const VITE_DIRECT_CSS = /\?direct$/;

export function chunkCssLinks( chunkAssets, isRTL = false ) {
	const styleAssets = chunkAssets[ isRTL ? 'css.rtl' : 'css.ltr' ];
	return styleAssets.map( ( asset ) =>
		VITE_DIRECT_CSS.test( asset ) ? (
			// Vite's client doesn't inject a stylesheet again when a link carries its module ID, which is
			// the file's absolute path. The server runs from the repo root.
			<link
				key={ asset }
				rel="stylesheet"
				type="text/css"
				href={ asset }
				data-vite-dev-id={ path.join( process.cwd(), asset.replace( VITE_DIRECT_CSS, '' ) ) }
			/>
		) : (
			<link key={ asset } rel="stylesheet" type="text/css" href={ asset } data-webpack />
		)
	);
}
