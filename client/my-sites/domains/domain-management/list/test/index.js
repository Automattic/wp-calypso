/** @jest-environment jsdom */
jest.mock( 'lib/user', () => () => {} );
jest.mock( 'lib/wp', () => ( {
	undocumented: () => ( {
		getProducts: () => {}
	} )
} ) );

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import assert from 'assert';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'state';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'index', function() {
	let React,
		ReactDom,
		ReactClass,
		DomainList,
		TestUtils,
		noticeTypes,
		component,
		sandbox;

	useSandbox( newSandbox => sandbox = newSandbox );

	before( () => {
		React = require( 'react' );
		ReactDom = require( 'react-dom' );
		TestUtils = require( 'react-addons-test-utils' );

		noticeTypes = require( '../constants' );

		ReactClass = require( 'react/lib/ReactClass' );
		ReactClass.injection.injectMixin( require( 'i18n-calypso' ).mixin );

		DomainList = require( '../' ).List;
	} );

	const selectedSite = deepFreeze( {
		slug: 'example.com',
		ID: 1
	} );

	const defaultProps = deepFreeze( {
		domains: {
			hasLoadedFromServer: true,
			list: [
				{ name: 'domain0.com', isPrimary: false },
				{ name: 'example.com', isPrimary: true }
			]
		},
		cart: {},
		context: {
			path: ''
		},
		products: {},
		selectedDomainName: 'example.com',
		selectedSite: selectedSite,
		sites: {
			getSelectedSite() {
				return selectedSite;
			}
		},
		sitePlans: {}
	} );

	function renderWithProps( props = defaultProps ) {
		const container = document.createElement( 'div' );
		const store = createReduxStore(),
			dom = ReactDom.render(
			<ReduxProvider store={ store }>
				<DomainList
					{ ...props }
				/>
			</ReduxProvider>,
			container
		);

		return TestUtils.scryRenderedComponentsWithType( dom, DomainList )[ 0 ];
	}

	describe( 'regular cases', function() {
		beforeEach( function() {
			component = renderWithProps();
		} );

		it( 'should list two domains', () => {
			assert.equal( [].slice.call( ReactDom.findDOMNode( component ).querySelectorAll( '.domain-management-list-item' ) ).length, 2 );
		} );
	} );

	describe( 'setting primary domain', () => {
		describe( 'when not enabled', () => {
			beforeEach( () => {
				component = renderWithProps();
			} );

			it( 'should show "Change Primary Domain" button', () => {
				assert( ReactDom.findDOMNode( component ).querySelector( '.domain-management-list__change-primary-button' ) );
			} );

			it( 'should enable upon clicking the button', () => {
				const button = ReactDom.findDOMNode( component ).querySelector( '.domain-management-list__change-primary-button' );
				TestUtils.Simulate.click( button );
				assert( component.state.changePrimaryDomainModeEnabled );
			} );
		} );

		describe( 'when enabled', () => {
			beforeEach( () => {
				component = renderWithProps();
				const button = ReactDom.findDOMNode( component ).querySelector( '.domain-management-list__change-primary-button' );
				TestUtils.Simulate.click( button );
			} );

			it( 'should show the cancel button', () => {
				assert( ReactDom.findDOMNode( component.refs.cancelChangePrimaryButton ) );
			} );

			it( 'should disable upon clicking cancel button', () => {
				const button = ReactDom.findDOMNode( component.refs.cancelChangePrimaryButton );
				TestUtils.Simulate.click( button );
				assert( ! component.state.changePrimaryDomainModeEnabled );
			} );

			it( 'should set the primaryDomainIndex correctly', () => {
				const primaryDomainIndex = 1; // from data above
				assert.equal( component.state.primaryDomainIndex, primaryDomainIndex );
			} );

			describe( '#handleUpdatePrimaryDomain', () => {
				let setPrimaryDomainStub,
					setPrimaryDomainResolve,
					setPrimaryDomainReject;
				beforeEach( () => {
					setPrimaryDomainStub = sandbox.stub( component, 'setPrimaryDomain' ).returns( new Promise( ( resolve, reject ) => {
						setPrimaryDomainResolve = resolve;
						setPrimaryDomainReject = reject;
					} ) );
				} );
				it( 'should not call setPrimaryDomain with on trying to set the already primary domain', () => {
					component.handleUpdatePrimaryDomain( 1, defaultProps.domains.list[ 1 ] );
					setPrimaryDomainResolve();
					assert( ! component.state.settingPrimaryDomain );
					assert( ! component.state.changePrimaryDomainModeEnabled );
					assert( ! setPrimaryDomainStub.called );
				} );

				it( 'should call setPrimaryDomain with a domain name', ( done ) => {
					component.handleUpdatePrimaryDomain( 0, defaultProps.domains.list[ 0 ] );
					assert( component.state.settingPrimaryDomain );
					assert( component.state.primaryDomainIndex === 0 );
					assert( setPrimaryDomainStub.calledWith( defaultProps.domains.list[ 0 ].name ),
						'#setPrimaryDomain should be called with the domain name' );
					setPrimaryDomainResolve();
					setTimeout( () => {
						assert( ! component.state.settingPrimaryDomain, 'Setting Primary Domain should be false' );
						assert( ! component.changePrimaryDomainModeEnabled );
						assert.equal( component.state.notice.type, noticeTypes.PRIMARY_DOMAIN_CHANGE_SUCCESS );
						assert.equal( component.state.notice.previousDomainName, defaultProps.domains.list[ 1 ].name );
						done();
					}, 0 );
				} );

				it( 'should handle errors and revert the optimistic updates', ( done ) => {
					component.handleUpdatePrimaryDomain( 0, defaultProps.domains.list[ 0 ] );
					setPrimaryDomainReject();
					setTimeout( () => {
						assert( ! component.state.settingPrimaryDomain );
						assert( component.state.changePrimaryDomainModeEnabled );
						assert.equal( component.state.primaryDomainIndex, 1 );
						assert.equal( component.state.notice.type, noticeTypes.PRIMARY_DOMAIN_CHANGE_FAIL );
						done();
					}, 0 );
				} );
			} );
		} );

		describe( 'when less than 2 domains', () => {
			beforeEach( () => {
				const oneDomain = deepFreeze( {
					domains: {
						hasLoadedFromServer: true,
						list: [
							{ name: 'example.com', isPrimary: true }
						]
					}
				} );
				const propsWithOneDomain = deepFreeze( Object.assign( {}, defaultProps, oneDomain ) );
				component = renderWithProps( propsWithOneDomain );
			} );

			it( 'should not show "Change Primary Domain" button', () => {
				const button = ReactDom.findDOMNode( component ).querySelector( '.domain-management-list__change-primary-button' );
				assert( button === null );
			} );
		} );
	} );
} );
