import { buildDomainSearchCart } from '../../test-helpers/factories';
import { DomainSearch } from '../domain-search';
import { DomainSuggestion } from '../domain-suggestion';
import { DomainSuggestionPrice } from '../domain-suggestion-price';
import type { Meta } from '@storybook/react';

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
			<DomainSearch
				onContinue={ () => {
					alert( 'Continue' );
				} }
				cart={ buildDomainSearchCart() }
			>
				<DomainSuggestion.RecommendedFQDN
					uuid="123"
					domain="example"
					tld="com"
					matchReasons={ [ 'Exact match', '.com is the most common extension' ] }
					price={ <DomainSuggestionPrice originalPrice="$97" price="$22" /> }
				/>
			</DomainSearch>
		</div>
	);
};

Default.parameters = {
	viewport: {
		defaultViewport: 'desktop',
	},
};

const meta: Meta< typeof Default > = {
	title: 'DomainSuggestion/RecommendedFQDN',
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
