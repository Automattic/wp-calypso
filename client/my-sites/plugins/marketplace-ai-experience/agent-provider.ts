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
	why: string;
	// Optional — the hydrator queries the named catalog directly when set,
	// or tries wp.org first with a commercial fallback when omitted.
	source?: PickSource;
}

const VALID_SOURCES: PickSource[] = [ 'wporg', 'commercial' ];

interface AbilityInput {
	picks?: Array< {
		slug?: string;
		why?: string;
		source?: string;
	} >;
}

function normalizeIncomingPicks( raw: AbilityInput[ 'picks' ] ): Pick[] {
	if ( ! Array.isArray( raw ) ) {
		return [];
	}

	const out: Pick[] = [];
	const seen = new Set< string >();
	for ( const p of raw ) {
		if ( ! p || typeof p.slug !== 'string' ) {
			continue;
		}

		const slug = p.slug.trim().toLowerCase();
		const why = typeof p.why === 'string' ? p.why.trim() : '';

		if ( ! slug || ! why ) {
			continue;
		}

		if ( seen.has( slug ) ) {
			continue;
		}

		const rawSource = typeof p.source === 'string' ? p.source.trim().toLowerCase() : '';
		const source = VALID_SOURCES.includes( rawSource as PickSource )
			? ( rawSource as PickSource )
			: undefined;

		seen.add( slug );
		out.push( source ? { slug, why, source } : { slug, why } );
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
					'Render plugin recommendation cards on the marketplace landing page. Pass the slug and a short personalized "why" for each pick; optionally include `source` ("wporg" or "commercial") when you know which catalog it came from to skip the wp.org-first lookup. Each slug must be one you saw in an earlier `plugin-marketplace-search` or `get-curated-plugins` call — invented slugs are dropped silently when they fail to hydrate.',
				input_schema: {
					type: 'object',
					additionalProperties: false,
					required: [ 'picks' ],
					properties: {
						picks: {
							type: 'array',
							description:
								'Ordered list of plugin recommendations. The first pick is treated as the lead/hero. Provide 1–10 picks (4 is the typical sweet spot).',
							minItems: 1,
							maxItems: 10,
							items: {
								type: 'object',
								additionalProperties: false,
								required: [ 'slug', 'why' ],
								properties: {
									slug: {
										type: 'string',
										description:
											'Plugin slug as it appears in the wp.org or WPcom commercial catalog (e.g. "wordpress-seo", "woocommerce").',
									},
									why: {
										type: 'string',
										maxLength: 400,
										description:
											"Short personalized rationale (1–2 sentences) tying the pick to the user's expressed goal. Plain text; no markdown links. Do not paste the plugin's description here — write your own editorial framing.",
									},
									source: {
										type: 'string',
										enum: VALID_SOURCES,
										description:
											'Optional. Which catalog the slug came from — "wporg" for wp.org plugins, "commercial" for the WPcom commercial marketplace. Omit if unknown; the hydrator will look up wp.org first and fall back to commercial.',
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
