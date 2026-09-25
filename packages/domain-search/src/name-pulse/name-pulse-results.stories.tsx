import { DomainAvailabilityStatus } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { getTld } from '../helpers';
import { DomainSearchContext, useDomainSearchContextValue } from '../page/context';
import { InitialState } from '../page/initial-state';
import {
	buildNamePulseAvailabilityEntry,
	buildNamePulseAvailabilityResponse,
	buildNamePulseBundle,
	NAME_PULSE_AI_SUGGESTIONS_FIXTURE,
	NAME_PULSE_AVAILABILITY_FIXTURE,
	NAME_PULSE_SUGGESTIONS_FIXTURE,
	NAME_PULSE_TLDS_FIXTURE,
	withNamePulseQueries,
} from '../test-helpers/factories/name-pulse';
import { NamePulseResults } from '.';
import type { DomainSearchCart, DomainSearchProps, SelectedDomain } from '../page/types';
import type { DomainAvailability } from '@automattic/api-core';
import type { Meta } from '@storybook/react';

import '../page/style.scss';

const queryClient = new QueryClient( {
	defaultOptions: { queries: { retry: false } },
} );

/**
 * Rows omitted from the bulk response and a rejected single-name batch both land
 * in the UNKNOWN ("Couldn’t check") state.
 */
const OMITTED = new Set( [ 'icecream.app', 'icecream.info' ] );
const FAILING = 'icecream.app';

const delay = ( ms: number ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );

/**
 * The bulk check prices premium names at the standard TLD rate; only this
 * per-domain check knows the registry price, so it quotes a much higher one.
 */
const PREMIUM_REALTIME_PRICE = 3500;

const toRealtimeAvailability = ( domainName: string ): DomainAvailability => {
	const entry = NAME_PULSE_AVAILABILITY_FIXTURE[ domainName ] ?? buildNamePulseAvailabilityEntry();
	let status = DomainAvailabilityStatus.NOT_AVAILABLE;

	if ( entry.is_available ) {
		status = entry.is_premium
			? DomainAvailabilityStatus.AVAILABLE_PREMIUM
			: DomainAvailabilityStatus.AVAILABLE;
	}

	const isPremium = status === DomainAvailabilityStatus.AVAILABLE_PREMIUM;

	return {
		domain_name: domainName,
		tld: getTld( domainName ),
		status,
		mappable: 'mappable',
		supports_privacy: true,
		root_domain_provider: 'wpcom',
		cost: isPremium ? `$${ PREMIUM_REALTIME_PRICE }.00` : ( entry.cost ?? '' ),
		raw_price: isPremium ? PREMIUM_REALTIME_PRICE : entry.raw_price,
		sale_cost: isPremium ? undefined : entry.sale_cost,
		currency_code: 'USD',
		product_slug: 'domain_reg',
		product_id: 6,
		...( isPremium ? { is_supported_premium_domain: true } : {} ),
	};
};

const useStoryCart = (): DomainSearchCart => {
	const [ items, setItems ] = useState< SelectedDomain[] >( [] );
	const total = items.reduce(
		( sum, item ) => sum + parseFloat( ( item.salePrice ?? item.price ).replace( '$', '' ) ),
		0
	);

	return {
		items,
		total: `$${ total }`,
		hasItem: ( domainName ) =>
			items.some( ( item ) => `${ item.domain }.${ item.tld }` === domainName ),
		onAddItem: async ( item ) => {
			const tld = getTld( item.domain_name );

			setItems( ( current ) => [
				...current,
				{
					uuid: item.domain_name,
					domain: item.domain_name.slice( 0, -( tld.length + 1 ) ),
					tld,
					price: item.cost,
					salePrice: item.sale_cost ? `$${ item.sale_cost }` : undefined,
				},
			] );
		},
		onAddBundle: async ( bundle ) => {
			setItems( ( current ) => [
				...current,
				...bundle.domains.map( ( { domain, cost } ) => {
					const tld = getTld( domain );

					return {
						uuid: domain,
						domain: domain.slice( 0, -( tld.length + 1 ) ),
						tld,
						price: cost,
					};
				} ),
			] );
		},
		onRemoveItem: async ( uuid ) => {
			setItems( ( current ) => current.filter( ( item ) => item.uuid !== uuid ) );
		},
	};
};

const StoryDomainSearch = ( {
	query,
	slots,
}: {
	query: string;
	slots?: DomainSearchProps[ 'slots' ];
} ) => {
	const cart = useStoryCart();
	const [ currentQuery, setCurrentQuery ] = useState( query );
	const contextValue = useDomainSearchContextValue( {
		cart,
		query: currentQuery,
		slots,
		config: { showNamePulseSearch: true, showBundleSuggestions: true },
		events: { onQueryChange: setCurrentQuery, onQueryClear: () => setCurrentQuery( '' ) },
	} );

	return (
		<QueryClientProvider client={ queryClient }>
			<DomainSearchContext.Provider
				value={ withNamePulseQueries( contextValue, {
					availability: async ( domainNames ) => {
						await delay( 600 );

						if ( domainNames.length === 1 && domainNames[ 0 ] === FAILING ) {
							throw new Error( 'Availability check failed' );
						}

						return buildNamePulseAvailabilityResponse(
							domainNames.filter( ( name ) => ! OMITTED.has( name ) )
						);
					},
					suggestions: async ( { use_ai } ) => {
						await delay( use_ai ? 2400 : 1200 );

						return {
							suggestions: use_ai
								? NAME_PULSE_AI_SUGGESTIONS_FIXTURE
								: NAME_PULSE_SUGGESTIONS_FIXTURE,
							errors: [],
						};
					},
					tlds: async () => {
						await delay( 400 );

						return NAME_PULSE_TLDS_FIXTURE;
					},
					domainAvailability: async ( domainName ) => {
						await delay( 900 );

						return toRealtimeAvailability( domainName );
					},
					bundleForDomain: async ( fqdn ) => {
						await delay( 700 );

						return buildNamePulseBundle( fqdn );
					},
				} ) }
			>
				<div className="domain-search" style={ { padding: '2rem 1rem' } }>
					{ currentQuery ? <NamePulseResults /> : <InitialState /> }
				</div>
			</DomainSearchContext.Provider>
		</QueryClientProvider>
	);
};

const meta: Meta< typeof StoryDomainSearch > = {
	title: 'NamePulse/Results',
	component: StoryDomainSearch,
};

export default meta;

export const SingleWord = () => <StoryDomainSearch query="icecream" />;

// The typed `.com` anchors its own bundle, beside the exact-match card.
export const Fqdn = () => <StoryDomainSearch query="icecream.com" />;

// `.blog` anchors no bundle, so the first top result that does (`.com`) stands in.
export const FqdnWithoutOwnBundle = () => <StoryDomainSearch query="icecream.blog" />;

// No card for a taken name; the bundle moves under Top results.
export const FqdnTaken = () => <StoryDomainSearch query="icecream.io" />;

export const MultiWord = () => <StoryDomainSearch query="ice cream" />;

export const AiMode = () => <StoryDomainSearch query="a blog about ice cream" />;

// Truncated on desktop, wrapped onto a second line below it.
export const LongName = () => <StoryDomainSearch query="icecreamshopnearsuratairport" />;

// Starts on the initial state so the swap to the results page can be checked
// for layout shifts.
export const EmptyQuery = () => <StoryDomainSearch query="" />;

// The real promo card lives in `client/`, out of this package's reach.
const BeforeResultsStandIn = () => (
	<div style={ { padding: '1rem', border: '1px dashed currentColor' } }>Promo card slot</div>
);

export const WithBeforeResults = () => (
	<StoryDomainSearch query="icecream" slots={ { BeforeResults: BeforeResultsStandIn } } />
);
