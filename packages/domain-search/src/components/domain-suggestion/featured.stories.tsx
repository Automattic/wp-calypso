import { buildDomainSearchCart } from '../../test-helpers/factories';
import { DomainSearch } from '../domain-search';
import { DomainSuggestionBadge } from '../domain-suggestion-badge';
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
			<DomainSearch
				onContinue={ () => {
					alert( 'Continue' );
				} }
				cart={ buildDomainSearchCart() }
			>
				{ children }
			</DomainSearch>
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
				uuid="123"
				domain="example"
				tld="com"
				price={ <DomainSuggestionPrice originalPrice="$97" price="$22" /> }
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
				uuid="123"
				domain="example"
				tld="com"
				isHighlighted
				matchReasons={ [ 'Exact match', '.com is the most common extension' ] }
				price={ <DomainSuggestionPrice originalPrice="$97" price="$22" /> }
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
