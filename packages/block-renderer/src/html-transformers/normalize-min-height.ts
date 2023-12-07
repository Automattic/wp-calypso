export default function normalizeMinHeight( patternHtml: string, viewportHeight: number ) {
	return patternHtml.replace( /min-height:\s?(?<value>\d+)vh;?/g, ( match, value ) => {
		// Replace with the percentage of viewport height in pixels.
		return `min-height:${ ( Number( value ) * viewportHeight ) / 100 }px;`;
	} );
}
