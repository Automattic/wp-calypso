/**
 * Curated examples of canonical Gutenberg block markup, keyed by block name.
 *
 * The dictation assistant should consult these BEFORE inserting or modifying a
 * block whose attribute schema is non-obvious from get_block_type_tool alone
 * (e.g. structured blocks like jetpack/map, where `points`, `mapCenter`, the
 * matching data-* attributes, and the inner <ul><li> fallback markup must all
 * line up). Each entry includes the canonical comment-delimited HTML so the
 * model can copy the attribute shape verbatim and substitute its own data.
 */

export interface BlockExample {
	/**
	 * Short human-readable label, e.g. "Two-pin map (Mexico City + New York)".
	 */
	title: string;
	/**
	 * Free-form notes the model should keep in mind (gotchas, required keys,
	 * how the example was generated, etc.). Optional.
	 */
	notes?: string;
	/**
	 * The canonical Gutenberg-serialized markup for the block, including the
	 * `<!-- wp:... -->` / `<!-- /wp:... -->` comment delimiters. The JSON
	 * inside the opening comment is the source of truth for the block's
	 * `attributes`; the HTML between the delimiters is the saved fallback.
	 */
	serializedHtml: string;
}

export const BLOCK_EXAMPLES: Record< string, BlockExample[] > = {
	'jetpack/map': [
		{
			title: 'Two-pin map: Mexico City and New York',
			notes:
				'Use this shape for a jetpack/map. The `points` attribute drives both the rendered pins AND the data-points attribute on the wrapper div (HTML-escaped JSON). `mapCenter` is { lat, lng } — note "lat"/"lng", not "latitude"/"longitude" (the latter is used inside each point\'s `coordinates`). `zoom` is a number. The inner <ul><li><a> markup is the saved fallback for non-JS contexts and should mirror the points list.',
			serializedHtml: `<!-- wp:jetpack/map {"points":[{"placeTitle":"Mexico City, Mexico","title":"Mexico City, Mexico","caption":"Mexico City, Mexico","coordinates":{"longitude":-99.133595,"latitude":19.4309037},"id":"Mexico City, Mexico 19.43 -99.13"},{"placeTitle":"New York, NY, United States","title":"New York, NY, United States","caption":"New York, NY, United States","coordinates":{"longitude":-74.007205,"latitude":40.7129822},"id":"New York, NY, United States 40.71 -74.01"}],"address":"Mexico City","zoom":12,"mapCenter":{"lat":30.619809008449884,"lng":-86.57040000000002}} -->
<div class="wp-block-jetpack-map" data-map-style="default" data-map-details="true" data-points="[{&quot;placeTitle&quot;:&quot;Mexico City, Mexico&quot;,&quot;title&quot;:&quot;Mexico City, Mexico&quot;,&quot;caption&quot;:&quot;Mexico City, Mexico&quot;,&quot;coordinates&quot;:{&quot;longitude&quot;:-99.133595,&quot;latitude&quot;:19.4309037},&quot;id&quot;:&quot;Mexico City, Mexico 19.43 -99.13&quot;},{&quot;placeTitle&quot;:&quot;New York, NY, United States&quot;,&quot;title&quot;:&quot;New York, NY, United States&quot;,&quot;caption&quot;:&quot;New York, NY, United States&quot;,&quot;coordinates&quot;:{&quot;longitude&quot;:-74.007205,&quot;latitude&quot;:40.7129822},&quot;id&quot;:&quot;New York, NY, United States 40.71 -74.01&quot;}]" data-zoom="12" data-map-center="{&quot;lat&quot;:30.619809008449884,&quot;lng&quot;:-86.57040000000002}" data-marker-color="red" data-show-fullscreen-button="true"><ul><li><a href="https://www.google.com/maps/search/?api=1&amp;query=19.4309037,-99.133595">Mexico City, Mexico</a></li><li><a href="https://www.google.com/maps/search/?api=1&amp;query=40.7129822,-74.007205">New York, NY, United States</a></li></ul></div>
<!-- /wp:jetpack/map -->`,
		},
	],
};

/**
 * Return all curated examples for a block. Empty array if none exist yet.
 */
export function getBlockExamples( name: string | undefined | null ): BlockExample[] {
	if ( ! name || typeof name !== 'string' ) {
		return [];
	}
	return BLOCK_EXAMPLES[ name ] ?? [];
}

/**
 * Return the list of block names that currently have at least one curated
 * example. Useful for prompt-time discovery.
 */
export function getBlocksWithExamples(): string[] {
	return Object.keys( BLOCK_EXAMPLES ).sort();
}
