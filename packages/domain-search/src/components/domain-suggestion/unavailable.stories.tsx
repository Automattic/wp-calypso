import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { buildDomainSearchCart } from '../../test-helpers/factories';
import { DomainSearch } from '../domain-search';
import { DomainSuggestion } from '../domain-suggestion';
import type { Meta } from '@storybook/react';

export const Default = () => {
	const { __ } = useI18n();

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
				<DomainSuggestion.Unavailable
					domain="example-unavailable"
					tld="com"
					getReasonText={ ( { domain } ) =>
						createInterpolateElement( __( '<domain /> is already registered.' ), {
							domain,
						} )
					}
					onTransferClick={ () => alert( 'Your wish is an order!' ) }
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
	title: 'DomainSuggestion/Unavailable',
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
