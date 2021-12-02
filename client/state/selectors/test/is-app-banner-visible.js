import { expect } from 'chai';
import { isAppBannerVisible } from 'calypso/state/selectors/is-app-banner-visible';

describe( 'isAppBannerVisible()', () => {
	test( 'should return false if Terms or Service update banner is displayed', () => {
		const state = {
			legal: {
				tos: {
					displayPrompt: true,
				},
			},
		};
		const output = isAppBannerVisible( state );
		expect( output ).to.be.false;
	} );

	test( 'should return false if the app banner is not enabled', () => {
		const state = {
			ui: {
				appBannerVisibility: false,
				layoutFocus: {
					current: 'not-sidebar',
				},
			},
		};
		const output = isAppBannerVisible( state );
		expect( output ).to.be.false;
	} );

	test( 'should return false if current layout focus is sidebar', () => {
		const state = {
			ui: {
				appBannerVisibility: true,
				layoutFocus: {
					current: 'sidebar',
				},
			},
		};
		const output = isAppBannerVisible( state );
		expect( output ).to.be.false;
	} );

	test( 'should return false is fetching preferences', () => {
		const state = {
			ui: {
				appBannerVisibility: true,
				layoutFocus: {
					current: 'not-sidebar',
				},
			},
			preferences: {
				fetching: true,
			},
		};
		const output = isAppBannerVisible( state );
		expect( output ).to.be.false;
	} );

	test( 'should return false if in section not allowed', () => {
		const state = {
			ui: {
				appBannerVisibility: true,
				layoutFocus: {
					current: 'not-sidebar',
				},
				section: {
					name: 'not-allowed',
				},
			},
			preferences: {
				fetching: false,
			},
		};
		const output = isAppBannerVisible( state );
		expect( output ).to.be.false;
	} );
} );
