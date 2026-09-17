import { BundleCard } from '.';
import type { BundleSuggestion, BundleSuggestionDomain } from '@automattic/api-core';
import type { Meta } from '@storybook/react';

const StoryWrapper = ( { children }: { children: React.ReactNode } ) => {
	return (
		<div
			style={ {
				margin: '0 auto',
				padding: '1rem',
				boxSizing: 'border-box',
				width: '100%',
				maxWidth: '480px',
			} }
		>
			{ children }
		</div>
	);
};

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
		sld: 'example',
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
		// The card prefers the formatted `*_cost` strings over the raw numbers, so
		// derive them from the final prices to mirror what the backend returns.
		bundle_cost: base.bundle_cost ?? `$${ base.bundle_price }`,
		original_cost: base.original_cost ?? `$${ base.original_price }`,
	};
};

const meta: Meta< typeof BundleCard > = {
	title: 'Components/BundleCard',
	component: BundleCard,
};

export default meta;

export const TwoDomain = () => (
	<StoryWrapper>
		<BundleCard
			suggestion={ buildSuggestion(
				[
					buildDomain( { domain: 'example.com', cost: '$22.00' } ),
					buildDomain( { domain: 'example.net', cost: '$18.00' } ),
				],
				{ bundle_price: 36, original_price: 40, discount_percent: 10 }
			) }
			onAddToCart={ () => {} }
		/>
	</StoryWrapper>
);

export const ThreeDomain = () => (
	<StoryWrapper>
		<BundleCard
			suggestion={ buildSuggestion( [
				buildDomain( { domain: 'example.com', cost: '$22.00' } ),
				buildDomain( { domain: 'example.net', cost: '$18.00' } ),
				buildDomain( { domain: 'example.org', cost: '$20.00' } ),
			] ) }
			onAddToCart={ () => {} }
		/>
	</StoryWrapper>
);

export const FourDomain = () => (
	<StoryWrapper>
		<BundleCard
			suggestion={ buildSuggestion(
				[
					buildDomain( { domain: 'example.com', cost: '$22.00' } ),
					buildDomain( { domain: 'example.net', cost: '$18.00' } ),
					buildDomain( { domain: 'example.org', cost: '$20.00' } ),
					buildDomain( { domain: 'example.io', cost: '$30.00' } ),
				],
				{ bundle_price: 80, original_price: 90, discount_percent: 11 }
			) }
			onAddToCart={ () => {} }
		/>
	</StoryWrapper>
);

export const LongSld = () => (
	<StoryWrapper>
		<BundleCard
			suggestion={ buildSuggestion(
				[
					buildDomain( {
						domain: 'thisisaverylongsecondleveldomainnamethatshouldwrap.com',
						cost: '$22.00',
					} ),
					buildDomain( {
						domain: 'thisisaverylongsecondleveldomainnamethatshouldwrap.net',
						cost: '$18.00',
					} ),
				],
				{ sld: 'thisisaverylongsecondleveldomainnamethatshouldwrap' }
			) }
			onAddToCart={ () => {} }
		/>
	</StoryWrapper>
);

export const LongTlds = () => (
	<StoryWrapper>
		<BundleCard
			suggestion={ buildSuggestion( [
				buildDomain( { domain: 'example.photography', cost: '$48.00' } ),
				buildDomain( { domain: 'example.international', cost: '$52.00' } ),
				buildDomain( { domain: 'example.com', cost: '$22.00' } ),
			] ) }
			onAddToCart={ () => {} }
		/>
	</StoryWrapper>
);

export const WithPremiumDomain = () => (
	<StoryWrapper>
		<BundleCard
			suggestion={ buildSuggestion( [
				buildDomain( { domain: 'example.com', cost: '$3,500.00', is_premium: true } ),
				buildDomain( { domain: 'example.net', cost: '$18.00' } ),
			] ) }
			onAddToCart={ () => {} }
		/>
	</StoryWrapper>
);

export const WithError = () => (
	<StoryWrapper>
		<BundleCard
			suggestion={ buildSuggestion( [
				buildDomain( { domain: 'example.com', cost: '$22.00' } ),
				buildDomain( { domain: 'example.net', cost: '$18.00' } ),
			] ) }
			onAddToCart={ () => {} }
			errorMessage="Sorry, we can't determine the availability of the domain you're trying to register. Please try again in a few minutes."
		/>
	</StoryWrapper>
);

export const Empty = () => (
	<StoryWrapper>
		<BundleCard suggestion={ null } />
	</StoryWrapper>
);
