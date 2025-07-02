import { DomainSearch } from '../DomainSearch/DomainSearch';
import { Domain } from '../DomainSearch/types';
import { DomainSuggestionsRecommendation } from '.';
import type { Meta } from '@storybook/react';

const firstDomain = {
	badges: [ 'recommended' ],
	id: 'the-lasso.net',
	domain: 'the-lasso',
	tld: 'net',
	price: '$74',
} satisfies Domain;

const secondDomain = {
	badges: [ 'best_alternative' ],
	id: 'the-lasso.com',
	domain: 'the-lasso',
	tld: 'com',
	originalPrice: '$18',
	price: '$8',
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
					secondDomain,
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
				hasItem: ( domain ) => domain.id === secondDomain.id,
				onAddItem: ( domain ) => {
					alert( `Add ${ domain.domain }.${ domain.tld }` );
				},
				onRemoveItem: ( domain ) => {
					alert( `Remove ${ domain.domain }.${ domain.tld }` );
				},
			} }
		>
			<div style={ { margin: '2rem auto', display: 'flex', gap: '16px', width: '1024px' } }>
				<DomainSuggestionsRecommendation domain={ firstDomain } />
				<DomainSuggestionsRecommendation domain={ secondDomain } />
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
	title: 'DomainSuggestions/Recommendation',
	component: Default,
};

export default meta;
