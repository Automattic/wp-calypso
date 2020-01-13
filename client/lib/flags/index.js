/**
 * Given a country code, return a flag SVG file path
 *
 * @param   {string} countryCode  A two-letter ISO_3166-1_country code
 * @returns {string}              Flag SVG file path
 */
export function flagUrl( countryCode ) {
	try {
		return require( `flag-icon-css/flags/4x3/${ countryCode }.svg` );
	} catch ( e ) {
		// As a fallback, return a 'globe' SVG.
		// Unfortunately, we're not shipping SVGs with the `gridicons` npm --
		// instead, they're inlined inside React components.
		// The below SVG string was produced by running
		// `renderToStaticMarkup( <GridiconGlobe size={ 24 } /> )`
		// and changing the viewbox to fit with the 4x3 aspect ratio of flags.
		// TODO: Ship SVGs with the `gridicons` npm, load the globe SVG directly.

		const svg = `
			<svg
				class="gridicon gridicons-globe"
				height="24"
				width="24"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 3 24 18"
			>
				<g>
					<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18l2-2 1-1v-2h-2v-1l-1-1H9v3l2 2v1.93c-3.94-.494-7-3.858-7-7.93l1 1h2v-2h2l3-3V6h-2L9 5v-.41C9.927 4.21 10.94 4 12 4s2.073.212 3 .59V6l-1 1v2l1 1 3.13-3.13c.752.897 1.304 1.964 1.606 3.13H18l-2 2v2l1 1h2l.286.286C18.03 18.06 15.24 20 12 20z" />
				</g>
			</svg>`;

		return 'data:image/svg+xml;utf8,' + svg;
	}
}
