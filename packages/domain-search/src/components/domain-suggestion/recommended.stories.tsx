import { buildDomainSearchCart } from '../../test-helpers/factories';
import { DomainSearch } from '../domain-search';
import { DomainSuggestionBadge } from '../domain-suggestion-badge';
import { DomainSuggestionPrice } from '../domain-suggestion-price';
import { DomainSuggestion } from '.';
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
				<DomainSuggestion.Recommended
					badges={
						<>
							<DomainSuggestionBadge>Recommended</DomainSuggestionBadge>
							<DomainSuggestionBadge>Best alternative</DomainSuggestionBadge>
						</>
					}
					uuid="123"
					domain="example"
					tld="com"
					price={ <DomainSuggestionPrice originalPrice="$97" price="$22" alignment="left" /> }
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
	title: 'DomainSuggestion/Recommended',
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
