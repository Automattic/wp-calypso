/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import assert from 'assert';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'upgrades/domain-management/list', function() {
	let React,
		ReactDom,
		ReactInjection,
		DomainList,
		TestUtils,
		i18n,
		noticeTypes,
		component,
		sandbox;

	useSandbox( newSandbox => sandbox = newSandbox );

	require( 'test/helpers/use-fake-dom' )( '<div id="main" />' );
	require( 'test/helpers/use-mockery' )(
		mockery => {
			require( 'test/helpers/mocks/component-classes' )( mockery );
			require( 'test/helpers/mocks/component-tip' )( mockery );
			require( 'test/helpers/mocks/data-poller' )( mockery );
			i18n = require( 'test/helpers/mocks/i18n' )( mockery );

			React = require( 'react' );
			ReactDom = require( 'react-dom' );
			TestUtils = require( 'react-addons-test-utils' );

			noticeTypes = require( '../constants' );

			ReactInjection = require( 'react/lib/ReactInjection' );
			ReactInjection.Class.injectMixin( i18n );
			ReactInjection.Class.injectMixin( { moment } );

			const EMPTY_COMPONENT = React.createClass( {
				render() {
					return <div />;
				}
			} );
			mockery.registerMock( 'components/section-nav', EMPTY_COMPONENT );
		}
	);

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
		return ReactDom.render( <DomainList { ...props } />, document.getElementById( 'main' ) );
	}

	beforeEach( function() {
		DomainList = require( '../' ).List;
	} );

	describe( 'regular cases', function() {
		beforeEach( function() {
			component = renderWithProps();
		} );

		afterEach( function() {
			ReactDom.unmountComponentAtNode( document.getElementById( 'main' ) );
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

			afterEach( function() {
				ReactDom.unmountComponentAtNode( document.getElementById( 'main' ) );
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

			afterEach( function() {
				ReactDom.unmountComponentAtNode( document.getElementById( 'main' ) );
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
	} );
} );
