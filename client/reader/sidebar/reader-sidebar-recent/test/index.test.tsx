/**
 * @jest-environment jsdom
 */
import { SiteSubscriptionItem } from '@automattic/data-stores/src/reader/types';
import { screen } from '@testing-library/react';
import readerUi from 'calypso/state/reader-ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderSidebarRecent, { getReaderSidebarSiteName } from '../index';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: Object.assign( jest.fn(), { replace: jest.fn() } ),
} ) );

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: jest.fn(),
	recordGaEvent: jest.fn(),
} ) );

let mockSubscribedSites: Partial< SiteSubscriptionItem >[] = [];
jest.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	useSubscribedSites: () => mockSubscribedSites,
} ) );

function createSubscriptionItem(
	overrides: Partial< SiteSubscriptionItem > & { ID: number }
): Partial< SiteSubscriptionItem > {
	return {
		feed_ID: overrides.ID * 10,
		name: `Site ${ overrides.ID }`,
		URL: `https://site-${ overrides.ID }.example.com`,
		...overrides,
	};
}

function renderRecentDropdown( sites: Partial< SiteSubscriptionItem >[] ) {
	mockSubscribedSites = sites;
	return renderWithProvider(
		<ReaderSidebarRecent isOpen onClick={ jest.fn() } path="/reader" className="test-recent" />,
		{ reducers: { readerUi } }
	);
}

function getUnseenCount( container: HTMLElement ): HTMLElement | null {
	return container.querySelector( '.sidebar__expandable-title .a8c-count' );
}

describe( 'ReaderSidebarRecent unseen counts', () => {
	afterEach( () => {
		mockSubscribedSites = [];
	} );

	test( 'shows the total unseen count for the section, summed across all followed sites', () => {
		const { container } = renderRecentDropdown( [
			createSubscriptionItem( { ID: 1, name: 'Alpha', unseen_count: 3 } ),
			createSubscriptionItem( { ID: 2, name: 'Beta', unseen_count: 5 } ),
		] );

		expect( getUnseenCount( container ) ).toHaveTextContent( '8' );
	} );

	test( 'shows no header count when there are no unseen posts', () => {
		const { container } = renderRecentDropdown( [
			createSubscriptionItem( { ID: 1, name: 'Alpha', unseen_count: 0 } ),
			createSubscriptionItem( { ID: 2, name: 'Beta' } ),
		] );

		expect( getUnseenCount( container ) ).toBeNull();
	} );

	test( 'renders a per-site unseen badge only for sites that have unseen posts', () => {
		renderRecentDropdown( [
			createSubscriptionItem( { ID: 1, name: 'Alpha', unseen_count: 4 } ),
			createSubscriptionItem( { ID: 2, name: 'Beta', unseen_count: 0 } ),
		] );

		const alphaRow = screen.getByRole( 'link', { name: /Alpha/ } ).closest( 'li' );
		const betaRow = screen.getByRole( 'link', { name: /Beta/ } ).closest( 'li' );

		expect( alphaRow?.querySelector( '.a8c-count' ) ).toHaveTextContent( '4' );
		expect( alphaRow?.querySelector( '.a8c-count' ) ).toHaveAccessibleName( '4 unseen posts' );
		expect( betaRow?.querySelector( '.a8c-count' ) ).toBeNull();
	} );

	test( 'flags the section with the has-counts modifier when there are unseen posts', () => {
		const { container } = renderRecentDropdown( [
			createSubscriptionItem( { ID: 1, unseen_count: 2 } ),
		] );

		expect( container.querySelector( '.reader-sidebar-recent' ) ).toHaveClass( 'has-counts' );
	} );

	test( 'does not flag the section with has-counts when there are no unseen posts', () => {
		const { container } = renderRecentDropdown( [
			createSubscriptionItem( { ID: 1, unseen_count: 0 } ),
		] );

		expect( container.querySelector( '.reader-sidebar-recent' ) ).not.toHaveClass( 'has-counts' );
	} );
} );

// Untitled sites come back from the API URL-shaped with a trailing slash,
// e.g. "example.wordpress.com/".
describe( 'getReaderSidebarSiteName', () => {
	test( 'shows the mapped custom domain when the name is the free subdomain (with trailing slash)', () => {
		expect(
			getReaderSidebarSiteName( {
				name: 'exampleblog.wordpress.com/',
				URL: 'https://example.com',
			} )
		).toBe( 'example.com' );
	} );

	test( 'handles a name with protocol and trailing slash', () => {
		expect(
			getReaderSidebarSiteName( {
				name: 'https://exampleblog.wordpress.com/',
				URL: 'https://example.org',
			} )
		).toBe( 'example.org' );
	} );

	test( 'shows the mapped custom domain when the site has no name at all', () => {
		expect( getReaderSidebarSiteName( { name: '', URL: 'https://example.net' } ) ).toBe(
			'example.net'
		);
	} );

	test( 'keeps a real site title untouched', () => {
		expect(
			getReaderSidebarSiteName( { name: 'Example Site Title', URL: 'https://example.com' } )
		).toBe( 'Example Site Title' );
	} );

	test( 'shows the clean subdomain (no trailing slash) when the site has no custom domain', () => {
		expect(
			getReaderSidebarSiteName( {
				name: 'exampleblog.wordpress.com/',
				URL: 'https://exampleblog.wordpress.com',
			} )
		).toBe( 'exampleblog.wordpress.com' );
	} );

	test( 'falls back to the raw name when there is no URL to derive a domain from', () => {
		expect( getReaderSidebarSiteName( { name: 'Example Site Title', URL: '' } ) ).toBe(
			'Example Site Title'
		);
	} );

	test( 'derives an r/subreddit label from the URL for an unresolved subreddit', () => {
		expect(
			getReaderSidebarSiteName( {
				name: '',
				URL: 'https://www.reddit.com/r/simracing/.rss',
			} )
		).toBe( 'r/simracing' );
	} );

	test( 'derives a u/user label from a Reddit user URL', () => {
		expect(
			getReaderSidebarSiteName( {
				name: '',
				URL: 'https://www.reddit.com/user/spez/.rss',
			} )
		).toBe( 'u/spez' );
	} );

	test( 'prefers the r/subreddit handle over the generic reddit.com domain when the title is missing', () => {
		expect(
			getReaderSidebarSiteName( {
				name: '',
				URL: 'https://www.reddit.com/r/simracing/',
			} )
		).toBe( 'r/simracing' );
	} );

	test( 'keeps the resolved title for a subreddit once it has one', () => {
		expect(
			getReaderSidebarSiteName( {
				name: 'SimRacing',
				URL: 'https://www.reddit.com/r/simracing/',
			} )
		).toBe( 'SimRacing' );
	} );

	test( 'does not treat a reddit.com look-alike host as Reddit', () => {
		expect(
			getReaderSidebarSiteName( {
				name: '',
				URL: 'https://fakereddit.com/r/simracing/',
			} )
		).toBe( 'fakereddit.com' );
	} );
} );
