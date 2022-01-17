import { expect } from 'chai';
import { isE2ETest } from 'calypso/lib/e2e';
import { shouldDisplayAppBanner } from 'calypso/state/selectors/should-display-app-banner';

jest.mock( 'calypso/lib/e2e', () => ( {
	isE2ETest: jest.fn( () => false ),
} ) );

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

	test( 'should return false if in e2e test', () => {
		isE2ETest.mockReturnValueOnce( true );
		const state = {
			ui: {
				appBannerVisibility: true,
				layoutFocus: {
					current: 'not-sidebar',
				},
				section: {
					name: 'gutenberg-editor',
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
