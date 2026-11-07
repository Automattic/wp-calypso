export function chunkCssLinks( chunkAssets, isRTL = false ) {
	const styleAssets = chunkAssets[ isRTL ? 'css.rtl' : 'css.ltr' ];
	const viteIds = chunkAssets.viteIds;
	return styleAssets.map( ( asset ) =>
		viteIds ? (
			// PROTOTYPE (DOTMSD-1682): Vite's client skips injecting a sheet linked with its id.
			<link
				key={ asset }
				rel="stylesheet"
				type="text/css"
				href={ asset }
				data-vite-dev-id={ viteIds[ asset ] }
			/>
		) : (
			<link key={ asset } rel="stylesheet" type="text/css" href={ asset } data-webpack />
		)
	);
}
