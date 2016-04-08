import assert from 'assert';
import sinon from 'sinon';

describe( 'domain-management/edit/mapped-domain', () => {
	let React,
		MappedDomain,
		i18n,
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
			}
		};
	} );

	require( 'test/helpers/use-fake-dom' ).withContainer();

	require( 'test/helpers/use-mockery' )( mockery => {
		React = require( 'react' );
		TestUtils = require( 'react-addons-test-utils' );
		i18n = require( 'test/helpers/mocks/i18n' )( mockery );
		const ReactInjection = require( 'react/lib/ReactInjection' );
		ReactInjection.Class.injectMixin( i18n );
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
