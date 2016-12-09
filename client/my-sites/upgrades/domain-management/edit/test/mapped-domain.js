/**
 * External dependencies
 */
import assert from 'assert';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'mapped-domain', () => {
	let React,
		MappedDomain,
		props,
		TestUtils;

	before( () => {
		props = {
			selectedSite: {
				slug: 'neverexpires.wordpress.com',
				domain: 'neverexpires.com'
			},
			domain: {
				name: 'neverexpires.com',
				expirationMoment: null
			},
			settingPrimaryDomain: false
		};
	} );

	useFakeDom.withContainer();
	useMockery( mockery => {
		mockery.registerMock( 'lib/analytics', {} );
	} );

	before( () => {
		React = require( 'react' );
		TestUtils = require( 'react-addons-test-utils' );

		const ReactClass = require( 'react/lib/ReactClass' );
		ReactClass.injection.injectMixin( require( 'i18n-calypso' ).mixin );
		MappedDomain = require( '../mapped-domain.jsx' );
	} );

	it( 'should render when props.domain.expirationMoment is null', () => {
		const renderer = TestUtils.createRenderer();
		renderer.render( <MappedDomain { ...props } /> );
		const out = renderer.getRenderOutput();

		assert( out );
	} );

	it( 'should use selectedSite.slug for URLs', sinon.test( function() {
		const paths = require( 'my-sites/upgrades/paths' );
		const dnsStub = this.stub( paths, 'domainManagementDns' );
		const emailStub = this.stub( paths, 'domainManagementEmail' );

		const renderer = TestUtils.createRenderer();
		renderer.render( <MappedDomain { ...props } /> );
		renderer.getRenderOutput();

		assert( dnsStub.calledWith( 'neverexpires.wordpress.com', 'neverexpires.com' ) );
		assert( emailStub.calledWith( 'neverexpires.wordpress.com', 'neverexpires.com' ) );
	} ) );
} );
