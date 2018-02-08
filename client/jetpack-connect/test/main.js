/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import page from 'page';
import { externalRedirect } from 'lib/route';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { JetpackConnectMain } from '../main';

const REQUIRED_PROPS = {
	checkUrl: noop,
	confirmJetpackInstallStatus: noop,
	dismissUrl: noop,
	getJetpackSiteByUrl: noop,
	isRequestingSites: false,
	jetpackConnectSite: undefined,
	recordTracksEvent: jest.fn(),
};

jest.mock( 'page', () => ( {
	redirect: jest.fn(),
} ) );

jest.mock( 'lib/route/path', () => ( {
	externalRedirect: jest.fn(),
} ) );

describe( 'JetpackConnectMain', () => {
	describe( 'makeSafeRedirectionFunction', () => {
		const component = new JetpackConnectMain( REQUIRED_PROPS );

		beforeEach( () => {
			component.redirecting = false;
		} );

		test( 'should make a function that can calls the wrappe function', () => {
			const innerFunc = jest.fn();
			const wrapperFunc = component.makeSafeRedirectionFunction( innerFunc );
			expect( () => wrapperFunc() ).not.toThrow();
		} );

		test( 'should protect against multiple calls', () => {
			const innerFunc = jest.fn();
			const wrapperFunc = component.makeSafeRedirectionFunction( innerFunc );
			wrapperFunc();
			wrapperFunc();
			wrapperFunc();
			expect( innerFunc ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'goToPluginActivation', () => {
		const component = new JetpackConnectMain( REQUIRED_PROPS );

		beforeEach( () => {
			component.redirecting = false;
			component.props.recordTracksEvent.mockReset();
			externalRedirect.mockReset();
		} );

		test( 'should fire redirect', () => {
			component.goToPluginActivation( 'example.com' );

			expect( externalRedirect ).toHaveBeenCalledTimes( 1 );
			expect( externalRedirect.mock.calls[ 0 ] ).toMatchSnapshot();
		} );

		test( 'should dispatch analytics', () => {
			const url = 'example.com';
			component.goToPluginActivation( url );

			expect( component.props.recordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( component.props.recordTracksEvent.mock.calls[ 0 ] ).toMatchSnapshot();
		} );
	} );

	describe( 'goToPluginInstall', () => {
		const component = new JetpackConnectMain( REQUIRED_PROPS );

		beforeEach( () => {
			component.redirecting = false;
			component.props.recordTracksEvent.mockReset();
			externalRedirect.mockReset();
		} );

		test( 'should fire redirect', () => {
			component.goToPluginInstall( 'example.com' );

			expect( externalRedirect ).toHaveBeenCalledTimes( 1 );
			expect( externalRedirect.mock.calls[ 0 ] ).toMatchSnapshot();
		} );

		test( 'should dispatch analytics', () => {
			const url = 'example.com';
			component.goToPluginInstall( url );

			expect( component.props.recordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( component.props.recordTracksEvent.mock.calls[ 0 ] ).toMatchSnapshot();
		} );
	} );

	describe( 'goToRemoteAuth', () => {
		const component = new JetpackConnectMain( REQUIRED_PROPS );

		beforeEach( () => {
			component.redirecting = false;
			component.props.recordTracksEvent.mockReset();
			externalRedirect.mockReset();
		} );

		test( 'should fire redirect', () => {
			component.goToRemoteAuth( 'example.com' );

			expect( externalRedirect ).toHaveBeenCalledTimes( 1 );
			expect( externalRedirect.mock.calls[ 0 ] ).toMatchSnapshot();
		} );

		test( 'should dispatch analytics', () => {
			const url = 'example.com';
			component.goToRemoteAuth( url );

			expect( component.props.recordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( component.props.recordTracksEvent.mock.calls[ 0 ] ).toMatchSnapshot();
		} );
	} );

	describe( 'goToPlans', () => {
		const component = new JetpackConnectMain( {
			...REQUIRED_PROPS,
			recordTracksEvent: jest.fn(),
		} );

		beforeEach( () => {
			component.redirecting = false;
			component.props.recordTracksEvent.mockReset();
			page.redirect.mockReset();
		} );

		test( 'should fire redirect', () => {
			component.goToPlans( 'example.com' );

			expect( page.redirect ).toHaveBeenCalledTimes( 1 );
			expect( page.redirect ).toHaveBeenCalledWith( '/jetpack/connect/plans/example.com' );
		} );

		test( 'should redirect to a site slug', () => {
			const url = 'https://example.com/sub-directory-install';
			component.goToPlans( url );

			expect( page.redirect ).toHaveBeenCalledWith(
				'/jetpack/connect/plans/example.com::sub-directory-install'
			);
		} );

		test( 'should dispatch analytics', () => {
			const url = 'example.com';
			component.goToPlans( url );

			expect( component.props.recordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( component.props.recordTracksEvent.mock.calls[ 0 ] ).toMatchSnapshot();
		} );
	} );
} );
