/**
 * @jest-environment jsdom
 */
import { SiteSubscriptionItem } from '@automattic/data-stores/src/reader/types';
import { screen } from '@testing-library/react';
import readerUi from 'calypso/state/reader-ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderSidebarRecent from '../index';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: Object.assign( jest.fn(), { replace: jest.fn() } ),
} ) );

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: jest.fn(),
	recordGaEvent: jest.fn(),
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	...jest.requireActual( '@automattic/api-queries' ),
	isAutomatticianQuery: () => ( {
		queryKey: [ 'test', 'is-automattician' ],
		queryFn: () => true,
		initialData: true,
	} ),
} ) );

let mockSubscribedSites: Partial< SiteSubscriptionItem >[] = [];
let mockSubscribedFeedsInfo = { unseenCount: 0, feedIds: [], feedUrls: [] };
jest.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	useSubscribedSites: () => mockSubscribedSites,
	useSubscribedFeedsInfo: () => mockSubscribedFeedsInfo,
} ) );

jest.mock( 'calypso/reader/data/site-subscriptions/use-unsubscribe-with-undo', () => ( {
	useUnsubscribeWithUndo: () => jest.fn(),
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
		mockSubscribedFeedsInfo = { unseenCount: 0, feedIds: [], feedUrls: [] };
	} );

	test( 'shows the total unseen count for the section, summed across all followed sites', () => {
		mockSubscribedFeedsInfo = { unseenCount: 8, feedIds: [], feedUrls: [] };

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
		expect( alphaRow?.querySelector( '.a8c-count' ) ).toHaveAccessibleName( '4 unread (30 days)' );
		expect( betaRow?.querySelector( '.a8c-count' ) ).toBeNull();
	} );
} );
