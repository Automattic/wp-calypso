import { isMobile } from '@automattic/viewport';
import { expect } from 'chai';
import { isE2ETest } from 'calypso/lib/e2e';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import { shouldDisplayAppBanner } from 'calypso/state/selectors/should-display-app-banner';

jest.mock( 'calypso/lib/e2e', () => ( {
	isE2ETest: jest.fn( () => false ),
} ) );
jest.mock( '@automattic/viewport', () => ( {
	isMobile: jest.fn( () => true ),
} ) );
jest.mock( 'calypso/lib/mobile-app', () => ( {
	isWpMobileApp: jest.fn( () => false ),
} ) );

describe( 'shouldDisplayAppBanner()', () => {
	test( 'should return true if state is correct', () => {
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
				remoteValues: [ 'something' ],
			},
		};
		const output = shouldDisplayAppBanner( state );
		expect( output ).to.be.true;
	} );

	test( 'should return false if ToS update banner is displayed', () => {
		const state = {
			legal: {
				tos: {
					displayPrompt: true,
				},
			},
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
				remoteValues: [ 'something' ],
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
				section: {
					name: 'gutenberg-editor',
				},
			},
			preferences: {
				remoteValues: [ 'something' ],
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
				section: {
					name: 'gutenberg-editor',
				},
			},
			preferences: {
				remoteValues: [ 'something' ],
			},
		};
		const output = shouldDisplayAppBanner( state );
		expect( output ).to.be.false;
	} );

	test( 'should return false if has not received remote preferences', () => {
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
				remoteValues: null,
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
				remoteValues: [ 'something' ],
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
				remoteValues: [ 'something' ],
			},
		};
		const output = shouldDisplayAppBanner( state );
		expect( output ).to.be.false;
	} );

	test( 'should return false if not on mobile', () => {
		isMobile.mockReturnValueOnce( false );
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
				remoteValues: [ 'something' ],
			},
		};
		const output = shouldDisplayAppBanner( state );
		expect( output ).to.be.false;
	} );

	test( 'should return false if in the app', () => {
		isWpMobileApp.mockReturnValueOnce( true );
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
				remoteValues: [ 'something' ],
			},
		};
		const output = shouldDisplayAppBanner( state );
		expect( output ).to.be.false;
	} );
} );
