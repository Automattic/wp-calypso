/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import assert from 'assert'; // eslint-disable-line import/no-nodejs-modules
import deepFreeze from 'deep-freeze';
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { List as DomainList } from '../';
import { PRIMARY_DOMAIN_CHANGE_SUCCESS, PRIMARY_DOMAIN_CHANGE_FAIL } from '../constants';
import { createReduxStore } from 'state';
import { useSandbox } from 'test/helpers/use-sinon';

jest.mock( 'lib/user', () => () => {} );
jest.mock( 'lib/wp', () => ( {
	undocumented: () => ( {
		getProducts: () => {},
	} ),
} ) );

describe( 'index', () => {
	let component, sandbox;

	useSandbox( newSandbox => ( sandbox = newSandbox ) );

	const selectedSite = deepFreeze( {
		slug: 'example.com',
		ID: 1,
	} );

	const defaultProps = deepFreeze( {
		domains: [
			{ name: 'domain0.com', isPrimary: false },
			{ name: 'example.com', isPrimary: true },
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
	} );

	function renderWithProps( props = defaultProps ) {
		const container = document.createElement( 'div' );
		const store = createReduxStore(),
			dom = ReactDom.render(
				<ReduxProvider store={ store }>
					<DomainList { ...props } />
				</ReduxProvider>,
				container
			);

		return TestUtils.scryRenderedComponentsWithType( dom, DomainList )[ 0 ];
	}

	describe( 'regular cases', () => {
		beforeEach( () => {
			component = renderWithProps();
		} );

		test( 'should list two domains', () => {
			assert.equal(
				[].slice.call(
					ReactDom.findDOMNode( component ).querySelectorAll( '.domain-management-list-item' )
				).length,
				2
			);
		} );
	} );

	describe( 'setting primary domain', () => {
		describe( 'when not enabled', () => {
			beforeEach( () => {
				component = renderWithProps();
			} );

			test( 'should show "Change Primary Domain" button', () => {
				assert(
					ReactDom.findDOMNode( component ).querySelector(
						'.domain-management-list__change-primary-button'
					)
				);
			} );

			test( 'should enable upon clicking the button', () => {
				const button = ReactDom.findDOMNode( component ).querySelector(
					'.domain-management-list__change-primary-button'
				);
				TestUtils.Simulate.click( button );
				assert( component.state.changePrimaryDomainModeEnabled );
			} );
		} );

		describe( 'when enabled', () => {
			beforeEach( () => {
				component = renderWithProps();
				const button = ReactDom.findDOMNode( component ).querySelector(
					'.domain-management-list__change-primary-button'
				);
				TestUtils.Simulate.click( button );
			} );

			test( 'should show the cancel button', () => {
				assert( ReactDom.findDOMNode( component.refs.cancelChangePrimaryButton ) );
			} );

			test( 'should disable upon clicking cancel button', () => {
				const button = ReactDom.findDOMNode( component.refs.cancelChangePrimaryButton );
				TestUtils.Simulate.click( button );
				assert( ! component.state.changePrimaryDomainModeEnabled );
			} );

			test( 'should set the primaryDomainIndex correctly', () => {
				const primaryDomainIndex = 1; // from data above
				assert.equal( component.state.primaryDomainIndex, primaryDomainIndex );
			} );

			describe( '#handleUpdatePrimaryDomain', () => {
				let setPrimaryDomainStub, setPrimaryDomainResolve, setPrimaryDomainReject;
				beforeEach( () => {
					setPrimaryDomainStub = sandbox.stub( component, 'setPrimaryDomain' ).returns(
						new Promise( ( resolve, reject ) => {
							setPrimaryDomainResolve = resolve;
							setPrimaryDomainReject = reject;
						} )
					);
				} );
				test( 'should not call setPrimaryDomain with on trying to set the already primary domain', () => {
					component.handleUpdatePrimaryDomain( 1, defaultProps.domains[ 1 ] );
					setPrimaryDomainResolve();
					assert( ! component.state.settingPrimaryDomain );
					assert( ! component.state.changePrimaryDomainModeEnabled );
					assert( ! setPrimaryDomainStub.called );
				} );

				test( 'should call setPrimaryDomain with a domain name', done => {
					component.handleUpdatePrimaryDomain( 0, defaultProps.domains[ 0 ] );
					assert( component.state.settingPrimaryDomain );
					assert( component.state.primaryDomainIndex === 0 );
					assert(
						setPrimaryDomainStub.calledWith( defaultProps.domains[ 0 ].name ),
						'#setPrimaryDomain should be called with the domain name'
					);
					setPrimaryDomainResolve();
					setTimeout( () => {
						assert(
							! component.state.settingPrimaryDomain,
							'Setting Primary Domain should be false'
						);
						assert( ! component.changePrimaryDomainModeEnabled );
						assert.equal( component.state.notice.type, PRIMARY_DOMAIN_CHANGE_SUCCESS );
						assert.equal(
							component.state.notice.previousDomainName,
							defaultProps.domains[ 1 ].name
						);
						done();
					}, 0 );
				} );

				test( 'should handle errors and revert the optimistic updates', done => {
					component.handleUpdatePrimaryDomain( 0, defaultProps.domains[ 0 ] );
					setPrimaryDomainReject();
					setTimeout( () => {
						assert( ! component.state.settingPrimaryDomain );
						assert( component.state.changePrimaryDomainModeEnabled );
						assert.equal( component.state.primaryDomainIndex, 1 );
						assert.equal( component.state.notice.type, PRIMARY_DOMAIN_CHANGE_FAIL );
						done();
					}, 0 );
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
				const button = ReactDom.findDOMNode( component ).querySelector(
					'.domain-management-list__change-primary-button'
				);
				assert( button === null );
			} );
		} );
	} );

	describe( 'when user can not manage options', () => {
		let wrapper;
		beforeEach( () => {
			const props = deepFreeze( {
				...defaultProps,
				userCanManageOptions: false,
			} );

			wrapper = shallow( <DomainList { ...props } /> );
		} );

		test( 'shows an EmptyContent view', () => {
			assert.equal( wrapper.find( 'EmptyContent' ).length, 1 );
		} );
	} );
} );
