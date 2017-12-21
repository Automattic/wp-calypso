/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import page from 'page';
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
	recordTracksEvent: noop,
};

jest.mock( 'page', () => ( {
	redirect: jest.fn(),
} ) );

describe( 'JetpackConnectMain', () => {
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
