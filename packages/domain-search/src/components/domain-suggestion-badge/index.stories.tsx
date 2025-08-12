import { buildDomainSearchCart } from '../../test-helpers/factories';
import { DomainSearch } from '../domain-search';
import { DomainSuggestionBadge } from '.';
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
			<DomainSuggestionBadge>Badge</DomainSuggestionBadge>
		</StoryWrapper>
	);
};

const meta: Meta< typeof Default > = {
	title: 'DomainSuggestionBadge',
	component: Default,
};

export default meta;

export const WithPopover = () => {
	return (
		<StoryWrapper>
			<DomainSuggestionBadge popover="Premium domain names are usually short, easy to remember, contain popular keywords, or some combination of these factors. Premium domain names are not eligible for purchase using the free plan domain credit.">
				Premium domain
			</DomainSuggestionBadge>
		</StoryWrapper>
	);
};

export const Warn = () => {
	return (
		<StoryWrapper>
			<DomainSuggestionBadge variation="warning">Warning</DomainSuggestionBadge>
		</StoryWrapper>
	);
};
