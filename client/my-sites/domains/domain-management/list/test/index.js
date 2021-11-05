/**
 * @jest-environment jsdom
 */

import {
	ShoppingCartProvider,
	getEmptyResponseCart,
	createShoppingCartManagerClient,
} from '@automattic/shopping-cart';
import deepFreeze from 'deep-freeze';
import { shallow, mount } from 'enzyme';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { List as DomainList } from '..';

const noop = () => {};

jest.mock( 'calypso/lib/wp', () => ( {
	undocumented: () => ( {
		getProducts: () => {},
		getSitePlans: () => {},
		getSiteFeatures: () => {},
	} ),
	req: {
		get: () => Promise.reject( new Error( '.get() not implemented in mock' ) ),
	},
} ) );

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
	let component;

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

	function renderWithProps( props = defaultProps ) {
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
		return mount( <DomainList { ...props } />, {
			wrappingComponent: TestProvider,
			wrappingComponentProps: { store, cartManagerClient },
		} );
	}

	describe( 'regular cases', () => {
		beforeEach( () => {
			component = renderWithProps();
		} );

		test( 'should list two domains', () => {
			expect( component.find( 'DomainItem' ) ).toHaveLength( 2 );
		} );
	} );

	describe( 'when user can not manage options', () => {
		test( 'shows an EmptyContent view', () => {
			const props = deepFreeze( {
				...defaultProps,
				userCanManageOptions: false,
			} );

			const wrapper = shallow( <DomainList { ...props } /> );

			expect( wrapper.find( 'EmptyContent' ) ).toHaveLength( 1 );
		} );
	} );
} );
