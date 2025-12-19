import { DomainSuggestionBadge } from '../domain-suggestion-badge';
import { DomainSuggestionPrimaryCTA } from '../domain-suggestion-cta';
import { DomainSuggestionPrice } from '../domain-suggestion-price';
import { DomainSuggestion } from '.';
import type { Meta } from '@storybook/react';

const StoryWrapper = ( { children }: { children: React.ReactNode } ) => {
	return (
		<div
			style={ {
				margin: '0 auto',
				padding: '1rem',
				boxSizing: 'border-box',
				width: '100%',
				maxWidth: '1040px',
			} }
		>
			{ children }
		</div>
	);
};

export const Default = () => {
	return (
		<StoryWrapper>
			<DomainSuggestion.Featured
				badges={
					<>
						<DomainSuggestionBadge>Recommended</DomainSuggestionBadge>
						<DomainSuggestionBadge>Best alternative</DomainSuggestionBadge>
					</>
				}
				domain="example"
				tld="com"
				price={ <DomainSuggestionPrice salePrice="$97" price="$22" /> }
				cta={ <DomainSuggestionPrimaryCTA>Add to cart</DomainSuggestionPrimaryCTA> }
			/>
		</StoryWrapper>
	);
};
const meta: Meta< typeof Default > = {
	title: 'DomainSuggestion/Featured',
	component: Default,
};

export default meta;

export const Highlighted = () => {
	return (
		<StoryWrapper>
			<DomainSuggestion.Featured
				badges={
					<DomainSuggestionBadge variation="success">It's available!</DomainSuggestionBadge>
				}
				domain="example"
				tld="com"
				isHighlighted
				matchReasons={ [ 'Exact match', '.com is the most common extension' ] }
				price={ <DomainSuggestionPrice salePrice="$97" price="$22" /> }
				cta={ <DomainSuggestionPrimaryCTA>Add to cart</DomainSuggestionPrimaryCTA> }
			/>
		</StoryWrapper>
	);
};

export const Placeholder = () => {
	return (
		<StoryWrapper>
			<DomainSuggestion.Featured.Placeholder />
		</StoryWrapper>
	);
};
