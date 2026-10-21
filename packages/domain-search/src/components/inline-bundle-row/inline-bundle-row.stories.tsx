import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DEFAULT_CONTEXT_VALUE, DomainSearchContext } from '../../page/context';
import { DomainSuggestionsList } from '../../ui';
import { InlineBundleRow } from '.';
import type { BundleSuggestion, BundleSuggestionDomain } from '@automattic/api-core';
import type { Meta } from '@storybook/react';

const queryClient = new QueryClient();

// InlineBundleRow reads the DomainSearch cart/events context and runs an
// add-to-cart mutation, so stories provide a minimal context (a no-op cart)
// plus a QueryClient. Spreading DEFAULT_CONTEXT_VALUE avoids the sentinel guard
// in useDomainSearch.
const storyContextValue = {
	...DEFAULT_CONTEXT_VALUE,
	cart: {
		...DEFAULT_CONTEXT_VALUE.cart,
		onAddBundle: () => Promise.resolve(),
		hasItem: () => false,
	},
};

const StoryWrapper = ( {
	children,
	addedToCart = false,
}: {
	children: React.ReactNode;
	addedToCart?: boolean;
} ) => (
	<QueryClientProvider client={ queryClient }>
		<DomainSearchContext.Provider
			value={ {
				...storyContextValue,
				cart: { ...storyContextValue.cart, hasItem: () => addedToCart },
			} }
		>
			<div
				style={ {
					margin: '0 auto',
					boxSizing: 'border-box',
					width: '100%',
					maxWidth: '640px',
				} }
			>
				<DomainSuggestionsList>{ children }</DomainSuggestionsList>
			</div>
		</DomainSearchContext.Provider>
	</QueryClientProvider>
);

const buildDomain = (
	overrides: Partial< BundleSuggestionDomain > & Pick< BundleSuggestionDomain, 'domain' | 'cost' >
): BundleSuggestionDomain => ( {
	raw_price: 22,
	product_slug: 'domain_reg',
	...overrides,
} );

const buildSuggestion = (
	domains: BundleSuggestionDomain[],
	overrides: Partial< BundleSuggestion > = {}
): BundleSuggestion => {
	const base = {
		sld: 'flowers',
		bundle_price: 60,
		original_price: 75,
		discount_percent: 20,
		category: 'business',
		bundle_id: 'bundle-1',
		bundle_group_id: 'group-1',
		catalogue_version: '2024-01-01',
		...overrides,
	};

	return {
		...base,
		domains,
		// The row prefers the formatted `*_cost` strings; derive them from the
		// final prices so stories render "$60" rather than a bare "60".
		bundle_cost: base.bundle_cost ?? `$${ base.bundle_price }`,
		original_cost: base.original_cost ?? `$${ base.original_price }`,
	};
};

const meta: Meta< typeof InlineBundleRow > = {
	title: 'Components/InlineBundleRow',
	component: InlineBundleRow,
};

export default meta;

export const TwoCompanions = () => (
	<StoryWrapper>
		<InlineBundleRow
			bundle={ buildSuggestion(
				[
					buildDomain( { domain: 'flowers.com', cost: '$22.00', role: 'primary' } ),
					buildDomain( { domain: 'flowers.net', cost: '$18.00', role: 'companion' } ),
					buildDomain( { domain: 'flowers.org', cost: '$20.00', role: 'companion' } ),
				],
				{ bundle_price: 60, original_price: 75, discount_percent: 20 }
			) }
			isLoading={ false }
		/>
	</StoryWrapper>
);

export const SingleCompanion = () => (
	<StoryWrapper>
		<InlineBundleRow
			bundle={ buildSuggestion(
				[
					buildDomain( { domain: 'flowers.com', cost: '$22.00', role: 'primary' } ),
					buildDomain( { domain: 'flowers.net', cost: '$18.00', role: 'companion' } ),
				],
				{ bundle_price: 36, original_price: 40, discount_percent: 10 }
			) }
			isLoading={ false }
		/>
	</StoryWrapper>
);

export const LongTlds = () => (
	<StoryWrapper>
		<InlineBundleRow
			bundle={ buildSuggestion( [
				buildDomain( { domain: 'flowers.com', cost: '$22.00', role: 'primary' } ),
				buildDomain( { domain: 'flowers.photography', cost: '$48.00', role: 'companion' } ),
				buildDomain( { domain: 'flowers.international', cost: '$52.00', role: 'companion' } ),
			] ) }
			isLoading={ false }
		/>
	</StoryWrapper>
);

export const Loading = () => (
	<StoryWrapper>
		<InlineBundleRow bundle={ undefined } isLoading />
	</StoryWrapper>
);

// Once every member is in the cart the row stays visible and its CTA swaps to a
// black "Continue" button, mirroring the top BundleCard's added-to-cart state.
export const AddedToCart = () => (
	<StoryWrapper addedToCart>
		<InlineBundleRow
			bundle={ buildSuggestion(
				[
					buildDomain( { domain: 'flowers.com', cost: '$22.00', role: 'primary' } ),
					buildDomain( { domain: 'flowers.net', cost: '$18.00', role: 'companion' } ),
				],
				{ bundle_price: 36, original_price: 40, discount_percent: 10 }
			) }
			isLoading={ false }
		/>
	</StoryWrapper>
);
