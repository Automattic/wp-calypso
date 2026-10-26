import { isWpcomSubdomainQuery, stripWpcomSubdomainSuffix } from '@automattic/domain-search';
import { addAvailabilityAsSuggestion } from '@automattic/domain-search/src/helpers/add-availability-as-suggestion';
import { isFqdnShownAsSuggestion } from '@automattic/domain-search/src/helpers/is-fqdn-shown-as-suggestion';
import { getPriceRuleForSuggestion } from '@automattic/domain-search/src/hooks/use-suggestion';
import { useSuggestionsList } from '@automattic/domain-search/src/hooks/use-suggestions-list';
import { useDomainSearch } from '@automattic/domain-search/src/page/context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import type {
	DomainAvailability,
	DomainSuggestion,
	FreeDomainSuggestion,
} from '@automattic/api-core';
import type { WebMcpTool } from '@automattic/webmcp';

type WebMcp = typeof import( '@automattic/webmcp' );
type ResultOptions = {
	suggestions?: ( DomainSuggestion & { position: number } )[];
	isLoading?: boolean;
	error?: string;
	freeSuggestion?: FreeDomainSuggestion;
};

const result = ( value: unknown ) => ( {
	content: [ { type: 'text', text: JSON.stringify( value ) } ],
} );
const emptyInput = { type: 'object', properties: {}, additionalProperties: false };

function reportError( error: unknown ) {
	// eslint-disable-next-line no-console
	console.warn( '[WebMCP] Domain search integration failed:', error );
}

export function DomainSearchWebMcp() {
	const { query, config } = useDomainSearch();
	const [ webMcp, setWebMcp ] = useState< WebMcp >();

	useEffect( () => {
		let disposed = false;
		void import( /* webpackChunkName: "webmcp" */ '@automattic/webmcp' )
			.then( ( api ) => {
				if ( ! disposed && api.getWebMcpModelContext() ) {
					setWebMcp( api );
				}
			} )
			.catch( reportError );
		return () => {
			disposed = true;
		};
	}, [] );

	if ( ! webMcp || config.showNamePulseSearch ) {
		return null;
	}

	return query ? (
		<DomainSearchResultsTools webMcp={ webMcp } />
	) : (
		<DomainSearchTools webMcp={ webMcp } />
	);
}

function DomainSearchResultsTools( { webMcp }: { webMcp: WebMcp } ) {
	const { query, queries, config, currentSiteUrl } = useDomainSearch();
	const { isLoading, featuredSuggestions, regularSuggestions } = useSuggestionsList();
	const { data = [], error } = useQuery( queries.domainSuggestions( query ) );
	const { data: availability } = useQuery( queries.domainAvailability( query ) );
	const { data: freeSuggestion } = useQuery(
		queries.freeSuggestion(
			isWpcomSubdomainQuery( query ) ? stripWpcomSubdomainSuffix( query ) : query
		)
	);
	const suggestions = availability ? addAvailabilityAsSuggestion( data, availability ) : data;
	const names = [
		...featuredSuggestions.map( ( { suggestion } ) => suggestion ),
		...regularSuggestions,
	];

	return (
		<DomainSearchTools
			webMcp={ webMcp }
			suggestions={ names.flatMap( ( name ) =>
				suggestions.flatMap( ( suggestion, position ) =>
					suggestion.domain_name === name ? [ { ...suggestion, position } ] : []
				)
			) }
			isLoading={ isLoading }
			error={ error?.message }
			freeSuggestion={
				config.hideFreeSubdomainSuggestion || currentSiteUrl ? undefined : freeSuggestion
			}
		/>
	);
}

function DomainSearchTools( { webMcp, ...results }: ResultOptions & { webMcp: WebMcp } ) {
	const context = useDomainSearch();
	const queryClient = useQueryClient();
	const currentRef = useRef( { context, results } );
	const mountedRef = useRef( true );
	useEffect( () => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, [] );
	useEffect( () => {
		currentRef.current = { context, results };
	}, [ context, results ] );

	const { mutateAsync: selectDomain } = useMutation( {
		mutationFn: async ( domainName: string ) => {
			const { context: current, results: currentResults } = currentRef.current;
			if ( queryClient.isMutating() > 1 || currentResults.isLoading ) {
				throw new Error( 'Wait for domain search and cart updates to finish.' );
			}
			const suggestion = currentResults.suggestions?.find(
				( suggestion ) => suggestion.domain_name === domainName
			);
			if ( ! suggestion ) {
				throw new Error( 'Choose a domain from wpcom_get_domain_search_results.' );
			}
			if ( current.cart.hasItem( domainName ) ) {
				return result( { domainName, inCart: true } );
			}
			const availability = await queryClient.ensureQueryData(
				current.queries.domainAvailability( domainName )
			);
			if ( ! mountedRef.current || currentRef.current.context !== current ) {
				throw new Error( 'Domain search changed. Read the current results and try again.' );
			}
			if (
				availability.is_price_limit_exceeded ||
				! isFqdnShownAsSuggestion( availability, current.config.includeOwnedDomainInSuggestions )
			) {
				throw new Error( 'This domain cannot be selected. Read the current results.' );
			}
			current.events.onDomainAddAvailabilityPreCheck( availability, domainName, suggestion.vendor );
			if ( availability.trademark_claims_notice_info ) {
				throw new Error( 'Select this domain on screen and review its trademark notice.' );
			}
			current.events.onSuggestionInteract( {
				...suggestion,
				position: suggestion.position,
				price_rule: getPriceRuleForSuggestion( {
					suggestion,
					priceRules: current.config.priceRules,
				} ),
			} );
			await current.cart.onAddItem( suggestion );
			current.events.onAddDomainToCart(
				domainName,
				suggestion.position,
				suggestion.is_premium ?? false,
				suggestion.vendor
			);
			return result( { domainName, selected: true, nextAction: 'Inspect the current screen.' } );
		},
		retry: false,
		networkMode: 'always',
	} );
	const selectRef = useRef( selectDomain );
	useEffect( () => {
		selectRef.current = selectDomain;
	}, [ selectDomain ] );

	useEffect( () => {
		const modelContext = webMcp.getWebMcpModelContext();
		if ( ! modelContext ) {
			return;
		}
		const getResults = () => {
			const { context: current, results: latest } = currentRef.current;
			return result( {
				query: current.query,
				isLoading: latest.isLoading ?? false,
				error: latest.error,
				suggestions:
					latest.suggestions?.map( ( suggestion ) => {
						const price =
							queryClient.getQueryData< DomainAvailability >(
								current.queries.domainAvailability( suggestion.domain_name ).queryKey
							) ?? suggestion;
						return {
							domainName: suggestion.domain_name,
							cost: price.cost,
							renewalCost: price.renew_cost,
							saleCost: price.sale_cost,
							currency: price.currency_code,
							priceRule: getPriceRuleForSuggestion( {
								suggestion,
								priceRules: current.config.priceRules,
							} ),
							isPremium: suggestion.is_premium ?? false,
							inCart: current.cart.hasItem( suggestion.domain_name ),
						};
					} ) ?? [],
				freeSuggestion: latest.freeSuggestion?.domain_name,
				canSkip: current.config.skippable,
				cart: current.cart.items,
				cartTotal: current.cart.total,
			} );
		};
		const tools: WebMcpTool[] = [
			{
				name: 'wpcom_search_domains',
				title: 'Search domains',
				description:
					'Search for a site address using the page search. Then read wpcom_get_domain_search_results until isLoading is false. Does not select or purchase a domain.',
				inputSchema: {
					type: 'object',
					properties: { query: { type: 'string', minLength: 1 } },
					required: [ 'query' ],
					additionalProperties: false,
				},
				annotations: { readOnlyHint: false, consequentialHint: false },
				execute: ( { query } ) => {
					if ( typeof query !== 'string' || ! /[a-zA-ZÀ-ÖÙ-öù-ÿĀ-žḀ-ỿ0-9]/.test( query ) ) {
						throw new Error( 'Provide a non-empty domain search query.' );
					}
					const { context: current } = currentRef.current;
					current.events.onSubmitButtonClick( query );
					current.setQuery( query, 'submit' );
					return result( {
						nextAction: 'Read wpcom_get_domain_search_results for the updated search.',
					} );
				},
			},
			{
				name: 'wpcom_get_domain_search_results',
				title: 'Get domain search results',
				description:
					'Read the current search, suggestions, standard and renewal prices, price rules, free site address, and cart. FREE_FOR_FIRST_YEAR requires an eligible paid plan; final prices are confirmed at checkout.',
				inputSchema: emptyInput,
				annotations: { readOnlyHint: true, consequentialHint: false },
				execute: getResults,
			},
			{
				name: 'wpcom_select_domain',
				title: 'Select a domain',
				description:
					'Select one of the current domain suggestions through the page cart action. May advance onboarding automatically. Does not purchase or register the domain. Trademark notices require interaction on screen.',
				inputSchema: {
					type: 'object',
					properties: { domainName: { type: 'string', minLength: 1 } },
					required: [ 'domainName' ],
					additionalProperties: false,
				},
				annotations: { readOnlyHint: false, consequentialHint: false },
				execute: ( { domainName } ) => {
					if ( typeof domainName !== 'string' || ! domainName.trim() ) {
						throw new Error( 'Provide a domain name from the current search results.' );
					}
					return selectRef.current( domainName.trim().toLowerCase() );
				},
			},
			{
				name: 'wpcom_continue_with_domains',
				title: 'Continue with selected domains',
				description:
					'Continue onboarding with the domains already in the page cart. Does not purchase them.',
				inputSchema: emptyInput,
				annotations: { readOnlyHint: false, consequentialHint: false },
				execute: () => {
					const { context: current } = currentRef.current;
					if ( queryClient.isMutating() || ! current.cart.items.length ) {
						throw new Error( 'Select a domain and wait for cart updates before continuing.' );
					}
					current.events.onContinue();
					return result( { nextAction: 'Inspect the next onboarding screen.' } );
				},
			},
			...( context.config.skippable
				? [
						{
							name: 'wpcom_skip_domain',
							title: 'Continue without a custom domain',
							description:
								'Continue onboarding with the offered free site address, or choose a domain later. Does not select a paid domain or a plan.',
							inputSchema: emptyInput,
							annotations: { readOnlyHint: false, consequentialHint: false },
							execute: () => {
								const { context: current, results: latest } = currentRef.current;
								if ( ! current.config.skippable || latest.isLoading || queryClient.isMutating() ) {
									throw new Error( 'Wait for domain search and cart updates before skipping.' );
								}
								current.events.onSkip( latest.freeSuggestion );
								return result( { nextAction: 'Inspect the next onboarding screen.' } );
							},
						},
					]
				: [] ),
		];
		const registry = webMcp.createWebMcpToolRegistry( {
			modelContext,
			getTools: () =>
				tools.map( ( tool ) => ( {
					...tool,
					execute: async ( input, options ) => {
						try {
							return await tool.execute( input, options );
						} catch ( error ) {
							return {
								...result( { error: error instanceof Error ? error.message : String( error ) } ),
								isError: true,
							};
						}
					},
				} ) ),
		} );
		void registry.sync().catch( reportError );
		return () => registry.dispose();
	}, [ webMcp, queryClient, context.config.skippable ] );

	return null;
}
