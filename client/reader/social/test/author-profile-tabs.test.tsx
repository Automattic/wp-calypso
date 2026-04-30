/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SocialAuthorProfileTabs } from '../author-profile-tabs';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { replace: jest.fn() },
} ) );
const pageReplace = jest.mocked( page.replace );

const tabs = [
	{ slug: 'posts', title: 'Posts', path: '/x?tab=posts' },
	{ slug: 'replies', title: 'Replies', path: '/x?tab=replies' },
	{ slug: 'media', title: 'Media', path: '/x?tab=media' },
];

// NavTabs uses IntersectionObserver which jsdom does not provide.
beforeAll( () => {
	global.IntersectionObserver = class IntersectionObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof global.IntersectionObserver;
} );

afterAll( () => {
	// @ts-expect-error -- cleaning up the stub
	delete global.IntersectionObserver;
} );

beforeEach( () => pageReplace.mockClear() );

describe( 'SocialAuthorProfileTabs', () => {
	it( 'fires onTabClick + page.replace on a plain left click', async () => {
		const user = userEvent.setup();
		const onTabClick = jest.fn();
		renderWithProvider(
			<SocialAuthorProfileTabs tabs={ tabs } activeSlug="posts" onTabClick={ onTabClick } />
		);
		await user.click( screen.getByRole( 'menuitem', { name: 'Replies' } ) );
		expect( onTabClick ).toHaveBeenCalledWith( 'replies', 'posts' );
		expect( pageReplace ).toHaveBeenCalledWith( '/x?tab=replies' );
	} );

	it( 'no-ops when the active tab is clicked', async () => {
		const user = userEvent.setup();
		const onTabClick = jest.fn();
		renderWithProvider(
			<SocialAuthorProfileTabs tabs={ tabs } activeSlug="posts" onTabClick={ onTabClick } />
		);
		await user.click( screen.getByRole( 'menuitem', { name: 'Posts' } ) );
		expect( onTabClick ).not.toHaveBeenCalled();
		expect( pageReplace ).not.toHaveBeenCalled();
	} );

	it( 'passes through modifier-clicks', async () => {
		const user = userEvent.setup();
		const onTabClick = jest.fn();
		renderWithProvider(
			<SocialAuthorProfileTabs tabs={ tabs } activeSlug="posts" onTabClick={ onTabClick } />
		);
		await user.keyboard( '[MetaLeft>]' );
		await user.click( screen.getByRole( 'menuitem', { name: 'Replies' } ) );
		await user.keyboard( '[/MetaLeft]' );
		expect( pageReplace ).not.toHaveBeenCalled();
	} );
} );
