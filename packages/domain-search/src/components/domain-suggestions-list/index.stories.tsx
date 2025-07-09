import { useState } from 'react';
import { buildDomainSearchCart } from '../../test-helpers/factories';
import { DomainSearch } from '../domain-search';
import { SelectedDomain } from '../domain-search/types';
import { DomainSuggestionsListItem } from '../domain-suggestions-list-item';
import { DomainsSuggestionsList } from '.';
import type { Meta } from '@storybook/react';

const SUGGESTIONS: SelectedDomain[] = [];

export const Default = () => {
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
				<DomainsSuggestionsList>
					<DomainSuggestionsListItem.Unavailable
						domain="example"
						tld="com"
						unavailableReason="already-registered"
						onTransferClick={ () => alert( 'Your wish is an order!' ) }
					/>
					<DomainSuggestionsListItem
						domainUuid="1"
						domain="example"
						tld="com"
						originalPrice="$10"
						price="$0"
					/>
				</DomainsSuggestionsList>
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
	title: 'DomainsSuggestionsList',
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
