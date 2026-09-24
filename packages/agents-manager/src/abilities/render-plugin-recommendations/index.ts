import { __ } from '@wordpress/i18n';
import { errorResult, successResult } from '../ability-result';
import type { Ability, AbilityResult } from '../types';

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
			const normalizedUrl = item.url.trim();
			try {
				if ( ! [ 'http:', 'https:' ].includes( new URL( normalizedUrl ).protocol ) ) {
					continue;
				}
			} catch {
				continue;
			}
			url = normalizedUrl;
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

export function renderPluginRecommendations( input: unknown ): AbilityResult {
	const picks = normalizeRecommendations(
		input && typeof input === 'object' && 'picks' in input ? input.picks : undefined
	);
	if ( ! picks.length ) {
		return errorResult( 'Provide 1–10 valid plugin recommendations with a slug and explanation.' );
	}
	return {
		...successResult( __( 'Plugin recommendations', __i18n_text_domain__ ), { picks } ),
		agentMessage: JSON.stringify( {
			tool_id: PLUGIN_RECOMMENDATIONS_TOOL_ID,
			data: { picks },
		} ),
	};
}

export const renderPluginRecommendationsAbility: Ability = {
	name: 'wpcom/render-plugin-recommendations',
	label: __( 'Render plugin recommendations', __i18n_text_domain__ ),
	category: 'wpcom',
	description:
		'Display ordered plugin recommendations in chat. Use slugs from plugin-marketplace-search or get-curated-plugins and a short personalized explanation for each recommendation.',
	input_schema: {
		type: 'object',
		required: [ 'picks' ],
		properties: {
			picks: {
				type: 'array',
				minItems: 1,
				maxItems: 10,
				items: {
					type: 'object',
					required: [ 'slug', 'why' ],
					properties: {
						slug: { type: 'string' },
						why: { type: 'string', maxLength: 400 },
						url: { type: 'string', format: 'uri', pattern: '^https?://' },
						source: { type: 'string', enum: [ 'wporg', 'commercial' ] },
					},
				},
			},
		},
	},
	callback: renderPluginRecommendations,
};
