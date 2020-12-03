/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import { noop } from 'lodash';
import { ShoppingCartProvider, getEmptyResponseCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { List as DomainList } from '..';
import { createReduxStore } from 'calypso/state';

jest.mock( 'lib/wp', () => ( {
	undocumented: () => ( {
		getProducts: () => {},
		getSitePlans: () => {},
	} ),
} ) );

const emptyResponseCart = getEmptyResponseCart();

function getCart() {
	return Promise.resolve( emptyResponseCart );
}

function setCart() {
	return Promise.resolve( emptyResponseCart );
}

function TestProvider( { store, children } ) {
	return (
		<ShoppingCartProvider cartKey="1" getCart={ getCart } setCart={ setCart }>
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
			},
			( state ) => {
				return state;
			}
		);
		return mount( <DomainList { ...props } />, {
			wrappingComponent: TestProvider,
			wrappingComponentProps: { store },
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

	describe( 'setting primary domain', () => {
		describe( 'when not enabled', () => {
			beforeEach( () => {
				component = renderWithProps();
			} );

			test( 'should show "Change Primary Domain" button', () => {
				const button = component.find( {
					className: 'list__change-primary-domain',
				} );
				expect( button ).toHaveLength( 1 );
			} );

			test( 'should enable upon clicking the button', () => {
				const button = component.find( {
					className: 'list__change-primary-domain',
				} );
				button.simulate( 'click' );
				expect( component.state( 'changePrimaryDomainModeEnabled' ) ).toBe( true );
			} );
		} );

		describe( 'when enabled', () => {
			beforeEach( () => {
				component = renderWithProps();
				const button = component.find( {
					className: 'list__change-primary-domain',
				} );
				button.simulate( 'click' );
			} );

			test( 'should show the cancel button', () => {
				const cancelButton = component.find( {
					className: 'list__change-primary-domain',
				} );
				expect( cancelButton.text() ).toEqual( 'Cancel primary domain change' );
			} );

			test( 'should disable upon clicking cancel button', () => {
				const cancelButton = component.find( {
					className: 'list__change-primary-domain',
				} );
				cancelButton.simulate( 'click' );
				expect( component.state( 'changePrimaryDomainModeEnabled' ) ).toBe( false );
			} );

			test( 'should set the primaryDomainIndex correctly', () => {
				expect( component.state( 'primaryDomainIndex' ) ).toBe( 1 );
			} );

			describe( '#handleUpdatePrimaryDomain', () => {
				let setPrimaryDomainStub;
				let setPrimaryDomainResolve;
				let setPrimaryDomainReject;
				beforeEach( () => {
					setPrimaryDomainStub = jest
						.spyOn( component.instance(), 'setPrimaryDomain' )
						.mockReturnValue(
							new Promise( ( resolve, reject ) => {
								setPrimaryDomainResolve = resolve;
								setPrimaryDomainReject = reject;
							} )
						);
				} );

				test( 'should not call setPrimaryDomain with on trying to set the already primary domain', () => {
					component.instance().handleUpdatePrimaryDomain( 1, defaultProps.domains[ 1 ] );
					setPrimaryDomainResolve();
					expect( component.state( 'settingPrimaryDomain' ) ).toBe( false );
					expect( component.state( 'changePrimaryDomainModeEnabled' ) ).toBe( false );
					expect( setPrimaryDomainStub ).not.toHaveBeenCalled();
				} );

				test( 'should call setPrimaryDomain with a domain name', () => {
					return new Promise( ( done ) => {
						component.instance().handleUpdatePrimaryDomain( 0, defaultProps.domains[ 0 ] );
						expect( component.state( 'settingPrimaryDomain' ) ).toBe( true );
						expect( component.state( 'primaryDomainIndex' ) ).toBe( 0 );
						// `.setPrimaryDomain` should be called with the domain name
						expect( setPrimaryDomainStub ).toHaveBeenCalledWith( defaultProps.domains[ 0 ].name );
						setPrimaryDomainResolve();
						setTimeout( () => {
							expect( component.state( 'settingPrimaryDomain' ) ).toBe( false );
							expect( component.state( 'changePrimaryDomainModeEnabled' ) ).toBe( false );
							done();
						}, 0 );
					} );
				} );

				test( 'should handle errors and revert the optimistic updates', () => {
					return new Promise( ( done ) => {
						component.instance().handleUpdatePrimaryDomain( 0, defaultProps.domains[ 0 ] );
						setPrimaryDomainReject( { error: 'Message' } );
						setTimeout( () => {
							expect( component.state( 'settingPrimaryDomain' ) ).toBe( false );
							expect( component.state( 'changePrimaryDomainModeEnabled' ) ).toBe( true );
							expect( component.state( 'primaryDomainIndex' ) ).toBe( 1 );
							done();
						}, 0 );
					} );
				} );
			} );
		} );

		describe( 'when less than 2 domains', () => {
			beforeEach( () => {
				const oneDomain = deepFreeze( {
					domains: [ { name: 'example.com', isPrimary: true } ],
					isRequestingSiteDomains: true,
				} );
				const propsWithOneDomain = deepFreeze( Object.assign( {}, defaultProps, oneDomain ) );
				component = renderWithProps( propsWithOneDomain );
			} );

			test( 'should not show "Change Primary Domain" button', () => {
				const button = component.find( {
					className: 'list__change-primary-domain',
				} );
				expect( button ).toBeDisabled();
			} );
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
