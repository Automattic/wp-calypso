// Plugin Compass Agent Provider
// Registers the `wpcom/render-plugin-recommendations` ability the LLM calls to surface
// picks, validates incoming records, and hands them off to the host.

import {
	executeAbility,
	getAbilities,
	registerAbility,
	registerAbilityCategory,
} from '@wordpress/abilities';

const ABILITY_NAME = 'wpcom/render-plugin-recommendations';
const CATEGORY_SLUG = 'plugin-compass';

type PickSource = 'wporg' | 'commercial';

export interface Pick {
	slug: string;
	source: PickSource;
	why: string;
}

const VALID_SOURCES: PickSource[] = [ 'wporg', 'commercial' ];

interface AbilityInput {
	picks?: Array< {
		slug?: string;
		source?: string;
		why?: string;
	} >;
}

function normalizeIncomingPicks( raw: AbilityInput[ 'picks' ] ): Pick[] {
	if ( ! Array.isArray( raw ) ) {
		return [];
	}

	const out: Pick[] = [];
	const seen = new Set< string >();
	for ( const p of raw ) {
		if ( ! p || typeof p.slug !== 'string' || typeof p.source !== 'string' ) {
			continue;
		}

		const slug = p.slug.trim().toLowerCase();
		const source = p.source.trim().toLowerCase() as PickSource;
		const why = typeof p.why === 'string' ? p.why.trim() : '';

		if ( ! slug || ! VALID_SOURCES.includes( source ) || ! why ) {
			continue;
		}

		if ( seen.has( slug ) ) {
			continue;
		}

		seen.add( slug );
		out.push( { slug, source, why } );
	}

	return out;
}

interface ToolProviderOptions {
	onPicks: ( picks: Pick[] ) => void;
}

// Shared registration promise so concurrent callers don't double-register.
let registrationPromise: Promise< void > | null = null;

function ensureRegistered( onPicks: ( picks: Pick[] ) => void ): Promise< void > {
	if ( ! registrationPromise ) {
		registrationPromise = ( async () => {
			await registerAbilityCategory( CATEGORY_SLUG, {
				label: 'Plugin Compass',
				description: 'Capabilities exposed by the Plugin Compass experience.',
			} );

			await registerAbility( {
				name: ABILITY_NAME,
				label: 'Render Plugin Recommendations',
				category: CATEGORY_SLUG,
				description:
					'Render plugin recommendation cards on the marketplace landing page. Pass ONLY the slug, source ("wporg" | "commercial"), and a short personalized "why" for each pick. Each slug must be one you saw in an earlier `plugin-marketplace-search` or `get-curated-plugins` call — invented slugs are dropped silently when they fail to hydrate.',
				input_schema: {
					type: 'object',
					additionalProperties: false,
					required: [ 'picks' ],
					properties: {
						picks: {
							type: 'array',
							description:
								'Ordered list of plugin recommendations. The first pick is treated as the lead/hero. Provide 1–8 picks (3–5 is the typical sweet spot).',
							minItems: 1,
							maxItems: 8,
							items: {
								type: 'object',
								additionalProperties: false,
								required: [ 'slug', 'source', 'why' ],
								properties: {
									slug: {
										type: 'string',
										description:
											'Plugin slug as it appears in the wp.org or WPcom commercial catalog (e.g. "wordpress-seo", "woocommerce").',
									},
									source: {
										type: 'string',
										enum: VALID_SOURCES,
										description:
											'Which catalog the slug came from — "wporg" for wp.org plugins, "commercial" for WPcom commercial marketplace.',
									},
									why: {
										type: 'string',
										maxLength: 400,
										description:
											"Short personalized rationale (1–2 sentences) tying the pick to the user's expressed goal. Plain text; no markdown links. Do not paste the plugin's description here — write your own editorial framing.",
									},
								},
							},
						},
					},
				},
				callback: async ( input: AbilityInput ) => {
					const picks = normalizeIncomingPicks( input?.picks );
					onPicks( picks );

					return { rendered: true, count: picks.length };
				},
			} );
		} )().catch( ( error ) => {
			// Don't leave a poisoned promise in place — clear so the next
			// call retries registration from scratch.
			registrationPromise = null;
			throw error;
		} );
	}

	return registrationPromise;
}

export function createToolProvider( { onPicks }: ToolProviderOptions ) {
	return {
		getAbilities: async () => {
			await ensureRegistered( onPicks );

			return getAbilities().filter( ( a ) => a?.name === ABILITY_NAME );
		},
		executeAbility: async ( name: string, args: unknown ) => {
			await ensureRegistered( onPicks );

			if ( name !== ABILITY_NAME ) {
				throw new Error( `[plugin-compass] Ability "${ name }" is not allowed here.` );
			}

			return executeAbility( name, args );
		},
	};
}
