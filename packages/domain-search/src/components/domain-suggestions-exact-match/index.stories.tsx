import { DomainSearch } from '../DomainSearch/DomainSearch';
import { Domain } from '../DomainSearch/types';
import { DomainSuggestionsExactMatch } from '.';
import type { Meta } from '@storybook/react';

const firstDomain = {
	badges: [ 'available' ],
	id: 'the-lasso.net',
	domain: 'the-lasso',
	tld: 'net',
	price: '$74',
	matchReasons: [ 'exact_match', 'most_common_extension' ],
} satisfies Domain;

export const Default = () => {
	return (
		<DomainSearch
			initialQuery=""
			onContinue={ () => {
				alert( 'Continue' );
			} }
			cart={ {
				items: [
					firstDomain,
					{
						id: 'the-different-domain.com',
						domain: 'the-different-domain',
						tld: 'com',
						originalPrice: '$18',
						price: '$8',
					},
					{
						badges: [ 'best_alternative' ],
						id: 'the-different-domain1.com',
						domain: 'the-different-domain1',
						tld: 'com',
						originalPrice: '$18',
						price: '$8',
					},
					{
						id: 'the-different-domain2.com',
						domain: 'the-different-domain2',
						tld: 'com',
						originalPrice: '$18',
						price: '$8',
					},
				],
				total: '$74',
				hasItem: ( domain ) => domain.id === firstDomain.id,
				onAddItem: ( domain ) => {
					alert( `Add ${ domain.domain }.${ domain.tld }` );
				},
				onRemoveItem: ( domain ) => {
					alert( `Remove ${ domain.domain }.${ domain.tld }` );
				},
			} }
		>
			<div
				style={ {
					margin: '2rem auto',
					display: 'flex',
					padding: '2rem',
					boxSizing: 'border-box',
					width: '100%',
					maxWidth: '1024px',
				} }
			>
				<DomainSuggestionsExactMatch domain={ firstDomain } />
			</div>
		</DomainSearch>
	);
};

Default.parameters = {
	viewport: {
		defaultViewport: 'desktop',
	},
};

const meta: Meta< typeof Default > = {
	title: 'DomainSuggestions/ExactMatch',
	component: Default,
};

export default meta;
