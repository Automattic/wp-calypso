/**
 * @jest-environment jsdom
 */

import {
	ShoppingCartProvider,
	getEmptyResponseCart,
	createShoppingCartManagerClient,
} from '@automattic/shopping-cart';
import { render, screen } from '@testing-library/react';
import deepFreeze from 'deep-freeze';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { SiteDomains } from '../site-domains';

const noop = () => {};

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: () => Promise.reject( new Error( '.get() not implemented in mock' ) ),
	},
} ) );

jest.mock( 'calypso/my-sites/domains/domain-management/list/domain-row', () => () => (
	<div data-testid="domain-row" />
) );

const emptyResponseCart = getEmptyResponseCart();

function getCart() {
	return Promise.resolve( emptyResponseCart );
}

function setCart() {
	return Promise.resolve( emptyResponseCart );
}

function TestProvider( { store, cartManagerClient, children } ) {
	return (
		<ShoppingCartProvider
			options={ {
				defaultCartKey: '1',
			} }
			managerClient={ cartManagerClient }
		>
			<ReduxProvider store={ store }>{ children }</ReduxProvider>
		</ShoppingCartProvider>
	);
}

describe( 'index', () => {
	const selectedSite = deepFreeze( {
		slug: 'example.com',
		ID: 1,
	} );

	const defaultProps = deepFreeze( {
		domains: [
			{ name: 'domain0.com', isPrimary: false, canSetAsPrimary: true },
			{ name: 'example.com', isPrimary: true, canSetAsPrimary: true },
		],
		isRequestingSiteDomains: true,
		cart: {},
		context: {
			path: '',
		},
		products: {},
		selectedDomainName: 'example.com',
		selectedSite: selectedSite,
		sites: {
			getSelectedSite() {
				return selectedSite;
			},
		},
		sitePlans: {},
		userCanManageOptions: true,
		successNotice: noop,
		errorNotice: noop,
		translate: ( string ) => string,
	} );

	describe( 'regular cases', () => {
		test( 'should list two domains', () => {
			const store = createReduxStore(
				{
					purchases: {},
					ui: {
						selectedSiteId: 1,
						section: 'section',
					},
					documentHead: {},
					sites: {
						plans: [],
						domains: {
							items: [],
						},
					},
					currentUser: {
						capabilities: {},
					},
					productsList: {},
				},
				( state ) => {
					return state;
				}
			);
			const cartManagerClient = createShoppingCartManagerClient( { getCart, setCart } );

			render( <SiteDomains { ...defaultProps } />, {
				wrapper: ( { children } ) => (
					<TestProvider store={ store } cartManagerClient={ cartManagerClient }>
						{ children }
					</TestProvider>
				),
			} );

			expect( screen.getAllByTestId( 'domain-row' ) ).toHaveLength( 2 );
		} );
	} );

	describe( 'when user can not manage options', () => {
		test( 'shows an EmptyContent view', () => {
			const props = deepFreeze( {
				...defaultProps,
				userCanManageOptions: false,
			} );

			render( <SiteDomains { ...props } /> );

			expect( screen.queryByText( /not authorized to view this page/i ) ).toBeInTheDocument();
		} );
	} );
} );
