import { DomainSuggestion } from '../domain-suggestion';
import { DomainSuggestionBadge } from '../domain-suggestion-badge';
import { DomainSuggestionPrimaryCTA } from '../domain-suggestion-cta';
import { DomainSuggestionPrice } from '../domain-suggestion-price';
import { DomainSuggestionsList } from '.';
import type { Meta } from '@storybook/react';

const SUGGESTIONS = [
	{ uuid: '1', domain: 'tha-lasso', tld: 'com', price: '$10' },
	{ uuid: '2', domain: 'the-lasso', tld: 'com', price: '$10', salePrice: '$20' },
];

export const Default = () => {
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
			<DomainSuggestionsList>
				<DomainSuggestion.Unavailable
					domain="example-unavailable"
					tld="com"
					reason="already-registered"
					onTransferClick={ () => alert( 'Your wish is an order!' ) }
				/>
				{ SUGGESTIONS.map( ( suggestion ) => (
					<DomainSuggestion
						key={ suggestion.uuid }
						domain={ suggestion.domain }
						tld={ suggestion.tld }
						price={
							<DomainSuggestionPrice
								salePrice={ suggestion.salePrice }
								price={ suggestion.price }
							/>
						}
						badges={
							<>
								<DomainSuggestionBadge>Recommended</DomainSuggestionBadge>
								<DomainSuggestionBadge variation="warning">Sale</DomainSuggestionBadge>
							</>
						}
						cta={ <DomainSuggestionPrimaryCTA>Add to Cart</DomainSuggestionPrimaryCTA> }
					/>
				) ) }
			</DomainSuggestionsList>
		</div>
	);
};

Default.parameters = {
	viewport: {
		defaultViewport: 'desktop',
	},
};

const meta: Meta< typeof Default > = {
	title: 'DomainSuggestionsList',
	component: Default,
};

export default meta;

export const Mobile = () => {
	return <Default />;
};

Mobile.parameters = {
	viewport: {
		defaultViewport: 'mobile1',
	},
};
