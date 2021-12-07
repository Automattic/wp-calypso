import { expect } from 'chai';
import { shouldDisplayAppBanner } from 'calypso/state/selectors/should-display-app-banner';

describe( 'shouldDisplayAppBanner()', () => {
	test( 'should return false if ToS update banner is displayed', () => {
		const state = {
			legal: {
				tos: {
					displayPrompt: true,
				},
			},
		};
		const output = shouldDisplayAppBanner( state );
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
		const output = shouldDisplayAppBanner( state );
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
		const output = shouldDisplayAppBanner( state );
		expect( output ).to.be.false;
	} );

	test( 'should return false if fetching preferences', () => {
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
		const output = shouldDisplayAppBanner( state );
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
		const output = shouldDisplayAppBanner( state );
		expect( output ).to.be.false;
	} );
} );
