/**
 * External dependencies
 */
import { identity } from 'lodash';
import ReactClass from 'react/lib/ReactClass';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import assert from 'assert';
import paths from 'my-sites/domains/paths';
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
			settingPrimaryDomain: false,
			translate: identity
		};
	} );

	useFakeDom.withContainer();
	useMockery( mockery => {
		mockery.registerMock( 'lib/analytics', {} );
	} );

	before( () => {
	    React = require( 'react' );
		TestUtils = require( 'react-addons-test-utils' );

		ReactClass.injection.injectMixin( require( 'i18n-calypso' ).mixin );
		MappedDomain = require( '../mapped-domain.jsx' ).MappedDomain;
	} );

	it( 'should render when props.domain.expirationMoment is null', () => {
		const renderer = TestUtils.createRenderer();
		renderer.render( <MappedDomain { ...props } /> );
		const out = renderer.getRenderOutput();

		assert( out );
	} );

	it( 'should use selectedSite.slug for URLs', sinon.test( function() {
	    const dnsStub = this.stub( paths, 'domainManagementDns' );
		const emailStub = this.stub( paths, 'domainManagementEmail' );

		const renderer = TestUtils.createRenderer();
		renderer.render( <MappedDomain { ...props } /> );
		renderer.getRenderOutput();

		assert( dnsStub.calledWith( 'neverexpires.wordpress.com', 'neverexpires.com' ) );
		assert( emailStub.calledWith( 'neverexpires.wordpress.com', 'neverexpires.com' ) );
	} ) );
} );
