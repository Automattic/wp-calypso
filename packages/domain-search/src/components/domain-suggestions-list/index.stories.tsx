import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { buildDomain, buildDomainSearchCart } from '../../test-helpers/factories';
import { DomainSearch } from '../domain-search';
import { DomainSuggestion } from '../domain-suggestion';
import { DomainSuggestionBadge } from '../domain-suggestion-badge';
import { DomainSuggestionPrice } from '../domain-suggestion-price';
import { DomainSuggestionsList } from '.';
import type { Meta } from '@storybook/react';

const SUGGESTIONS = [
	buildDomain( { uuid: '1', domain: 'tha-lasso', tld: 'com', price: '$10' } ),
	buildDomain( { uuid: '2', domain: 'the-lasso', tld: 'com', price: '$10', originalPrice: '$20' } ),
];

export const Default = () => {
	const { __ } = useI18n();
	const [ cartItems, setCartItems ] = useState< string[] >( [] );

	const cart = buildDomainSearchCart( {
		items: cartItems
			.map( ( uuid ) => SUGGESTIONS.find( ( s ) => s.uuid === uuid ) )
			.filter( ( domain ) => !! domain ),
		onAddItem: ( uuid ) => {
			setCartItems( [ ...cartItems, uuid ] );
		},
		onRemoveItem: ( item ) => {
			setCartItems( cartItems.filter( ( i ) => i !== item ) );
		},
		hasItem: ( item ) => cartItems.some( ( i ) => i === item ),
	} );

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
				cart={ cart }
			>
				<DomainSuggestionsList>
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
					{ SUGGESTIONS.map( ( suggestion ) => (
						<DomainSuggestion
							key={ suggestion.uuid }
							uuid={ suggestion.uuid }
							domain={ suggestion.domain }
							tld={ suggestion.tld }
							notice={ suggestion.domain === 'tha-lasso' ? 'hello' : undefined }
							price={
								<DomainSuggestionPrice
									originalPrice={ suggestion.originalPrice }
									price={ suggestion.price }
								/>
							}
							badges={
								<>
									<DomainSuggestionBadge>Recommended</DomainSuggestionBadge>
									<DomainSuggestionBadge variation="warning">Sale</DomainSuggestionBadge>
								</>
							}
						/>
					) ) }
				</DomainSuggestionsList>
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
