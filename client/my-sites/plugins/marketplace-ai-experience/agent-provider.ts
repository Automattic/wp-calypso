// Plugin recommendations Agent Provider
// Registers the `wpcom/render-plugin-recommendations` ability the LLM calls to surface
// picks, validates incoming records, and hands them off to the host.

import {
	executeAbility,
	getAbilities,
	registerAbility,
	registerAbilityCategory,
} from '@wordpress/abilities';

const ABILITY_NAME = 'wpcom/render-plugin-recommendations';
const CATEGORY_SLUG = 'plugin-recommendations';

type PickSource = 'wporg' | 'commercial';

export interface Pick {
	slug: string;
	why: string;
	url?: string;
	// Optional — the hydrator queries the named catalog directly when set,
	// or tries wp.org first with a commercial fallback when omitted.
	source?: PickSource;
}

const VALID_SOURCES: PickSource[] = [ 'wporg', 'commercial' ];

interface AbilityInput {
	picks?: Array< {
		slug?: string;
		why?: string;
		url?: string;
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
		out.push( {
			slug,
			why,
			...( source && { source } ),
			...( p.url !== undefined && { url: p.url } ),
		} );
	}

	return out;
}

interface ToolProviderOptions {
	onPicks: ( picks: Pick[] ) => void;
}

// Shared registration promise so concurrent callers don't double-register.
let registrationPromise: Promise< void > | null = null;

function ensureRegistered(): Promise< void > {
	if ( ! registrationPromise ) {
		registrationPromise = ( async () => {
			await registerAbilityCategory( CATEGORY_SLUG, {
				label: 'Plugin recommendations',
				description: 'Capabilities exposed by the Plugin recommendations experience.',
			} );

			await registerAbility( {
				name: ABILITY_NAME,
				label: 'Render Plugin Recommendations',
				category: CATEGORY_SLUG,
				description:
					"First call `wpcom/plugin-search`. Render its results as ordered recommendation cards with personalized reasons. Pass each result's product URL as `url`, and format every plugin name in the chat reply as `[Plugin name](returned product URL)` using the exact URL from its search result.",
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
									url: {
										type: 'string',
										description:
											'Product URL from the search result. Preserve its query parameters; this URL is returned with the recommendation.',
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
				output_schema: {
					type: 'object',
					required: [ 'rendered', 'count', 'picks' ],
					properties: {
						rendered: { type: 'boolean' },
						count: { type: 'integer' },
						picks: {
							type: 'array',
							items: {
								type: 'object',
								required: [ 'slug', 'why' ],
								properties: {
									slug: { type: 'string' },
									why: { type: 'string' },
									source: { type: 'string', enum: VALID_SOURCES },
									url: { type: 'string' },
								},
							},
						},
					},
				},
				callback: async ( input: AbilityInput ) => {
					const picks = normalizeIncomingPicks( input?.picks );

					return { rendered: true, count: picks.length, picks };
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
			await ensureRegistered();

			return getAbilities().filter( ( a ) => a?.name === ABILITY_NAME );
		},
		executeAbility: async ( name: string, args: unknown ) => {
			await ensureRegistered();

			if ( name !== ABILITY_NAME ) {
				throw new Error( `[plugin-recommendations] Ability "${ name }" is not allowed here.` );
			}

			const result = await executeAbility( name, args );
			onPicks( result.picks );
			return result;
		},
	};
}
