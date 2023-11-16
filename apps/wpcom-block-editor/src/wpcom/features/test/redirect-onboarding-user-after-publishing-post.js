/**
 * @jest-environment jsdom
 */
import { RedirectOnboardingUserAfterPublishingPost } from '../redirect-onboarding-user-after-publishing-post';

beforeAll( () => {} );

const mockUnSubscribe = jest.fn();
const mockClosePublishSidebar = jest.fn();
const mockCloseSidebar = jest.fn();
const mockSubscribeFunction = [];
let mockIsSaving = false;

jest.mock( '@wordpress/data', () => ( {
	subscribe: ( userFunction ) => {
		mockSubscribeFunction.push( userFunction );

		return mockUnSubscribe;
	},
	select: ( item ) => {
		if ( item === 'core/editor' ) {
			return {
				isSavingPost: () => mockIsSaving,
				isCurrentPostPublished: () => true,
				getCurrentPostRevisionsCount: () => 1,
			};
		}

		if ( item === 'core/preferences' ) {
			return {
				get: () => true,
			};
		}
	},
	dispatch: () => {
		return {
			closePublishSidebar: () => {
				mockClosePublishSidebar();
			},
			closeGeneralSidebar: () => {
				mockCloseSidebar();
			},
		};
	},
} ) );

describe( 'RedirectOnboardingUserAfterPublishingPost', () => {
	it( 'should NOT redirect the user to the launchpad if start-writing query parameter is NOT present', () => {
		delete global.window;
		global.window = {
			location: {
				search: 'origin=https://calypso.localhost:3000',
				hostname: 'wordpress.com',
			},
		};

		RedirectOnboardingUserAfterPublishingPost();

		expect( mockCloseSidebar ).toHaveBeenCalledTimes( 0 );
		expect( mockSubscribeFunction[ 0 ] ).toBe( undefined );
		expect( global.window.location.href ).toBe( undefined );
	} );

	it( 'should NOT redirect while saving the POST', () => {
		mockIsSaving = true;
		delete global.window;
		global.window = {
			location: {
				search: '?start-writing=true&origin=https://calypso.localhost:3000',
				hostname: 'wordpress.com',
			},
		};

		RedirectOnboardingUserAfterPublishingPost();

		expect( mockSubscribeFunction[ 0 ] ).not.toBe( undefined );
		mockSubscribeFunction[ 1 ]();

		expect( mockUnSubscribe ).toHaveBeenCalledTimes( 0 );
		expect( global.window.location.href ).toBe( undefined );
	} );

	it( 'should redirect the user to the launchpad when a post is published and the start-writing query parameter is present', () => {
		jest.clearAllMocks();
		mockIsSaving = false;
		delete global.window;
		global.window = {
			location: {
				search: '?start-writing=true&origin=https://calypso.localhost:3000',
				hostname: 'wordpress.com',
			},
		};

		RedirectOnboardingUserAfterPublishingPost();
		mockSubscribeFunction[ 1 ]();

		expect( mockSubscribeFunction ).not.toBe( null );
		expect( mockUnSubscribe ).toHaveBeenCalledTimes( 1 );
		expect( mockClosePublishSidebar ).toHaveBeenCalledTimes( 1 );
		expect( global.window.location.href ).toBe(
			'https://calypso.localhost:3000/setup/start-writing/launchpad?siteSlug=wordpress.com&start-writing=true'
		);
	} );

	it( 'should should close the sidebar once isComplementaryAreaVisible === true', () => {
		jest.clearAllMocks();
		mockIsSaving = false;
		delete global.window;
		global.window = {
			location: {
				search: '?start-writing=true&origin=https://calypso.localhost:3000',
				hostname: 'wordpress.com',
			},
		};

		RedirectOnboardingUserAfterPublishingPost();
		mockSubscribeFunction[ 0 ]();

		expect( mockCloseSidebar ).toHaveBeenCalledTimes( 1 );
		expect( mockSubscribeFunction ).not.toBe( null );
	} );
} );
