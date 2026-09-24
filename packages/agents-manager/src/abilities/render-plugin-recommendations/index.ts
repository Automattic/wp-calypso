export const PLUGIN_RECOMMENDATIONS_TOOL_ID = 'wpcom__render_plugin_recommendations';

export interface PluginRecommendation {
	slug: string;
	why: string;
	url?: string;
	source?: 'wporg' | 'commercial';
}

export function normalizeRecommendations( input: unknown ): PluginRecommendation[] {
	if ( ! Array.isArray( input ) || input.length > 10 ) {
		return [];
	}
	const picks: PluginRecommendation[] = [];
	const seen = new Set< string >();
	for ( const item of input ) {
		if ( ! item || typeof item.slug !== 'string' || typeof item.why !== 'string' ) {
			continue;
		}
		const slug = item.slug.trim().toLowerCase();
		const why = item.why.trim();
		if (
			! /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test( slug ) ||
			! why ||
			why.length > 400 ||
			seen.has( slug )
		) {
			continue;
		}
		if ( item.source !== undefined && item.source !== 'wporg' && item.source !== 'commercial' ) {
			continue;
		}
		let url: string | undefined;
		if ( item.url !== undefined ) {
			if ( typeof item.url !== 'string' ) {
				continue;
			}
			url = item.url.trim();
			try {
				if ( ! [ 'http:', 'https:' ].includes( new URL( url ).protocol ) ) {
					continue;
				}
			} catch {
				continue;
			}
		}
		seen.add( slug );
		picks.push( {
			slug,
			why,
			...( url && { url } ),
			...( item.source && { source: item.source } ),
		} );
	}
	return picks;
}
