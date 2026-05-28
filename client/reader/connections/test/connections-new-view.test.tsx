/**
 * @jest-environment jsdom
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ConnectionsNewView } from '../connections-new-view';

type QueryShape = {
	isPending: boolean;
	isSuccess: boolean;
	isError: boolean;
	data?: { connections: unknown[] };
};

let mockQuery: QueryShape = {
	isPending: false,
	isSuccess: true,
	isError: false,
	data: { connections: [] },
};
let mockSites: unknown[] = [];
let mockPrimarySiteId: number | null = null;
const mockRecordTracksEvent = jest.fn();

jest.mock( '@automattic/api-queries', () => ( {
	useFediverseConnectionsQuery: () => mockQuery,
} ) );

jest.mock( 'calypso/state/selectors/get-sites', () => ( {
	__esModule: true,
	default: () => mockSites,
} ) );

jest.mock( 'calypso/state/selectors/get-primary-site-id', () => ( {
	__esModule: true,
	default: () => mockPrimarySiteId,
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => {
		mockRecordTracksEvent( ...args );
		return { type: '@@TEST/NOOP' };
	},
} ) );

// `ReaderMain`, `DocumentHead`, and `NavigationHeader` are chrome that
// pulls Redux slices and api-queries mutations we don't seed in this
// suite. Stub them out — these tests focus on the Fediverse card body.
jest.mock( 'calypso/reader/components/reader-main', () => ( {
	__esModule: true,
	default: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
} ) );
jest.mock( 'calypso/components/data/document-head', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( 'calypso/components/navigation-header', () => ( {
	__esModule: true,
	default: () => null,
} ) );

const adminSite = (
	id: number,
	name: string,
	admin_url: string | null = `https://${ name }.example/wp-admin/`
) => ( {
	ID: id,
	URL: `https://${ name }.example`,
	name,
	capabilities: { manage_options: true },
	options: admin_url ? { admin_url } : {},
} );

describe( 'ConnectionsNewView — Fediverse site picker', () => {
	beforeAll( () => {
		// `ComboboxControl` calls `scrollIntoView` on its suggestion-list options;
		// jsdom doesn't implement it.
		Element.prototype.scrollIntoView = jest.fn();
	} );

	beforeEach( () => {
		mockQuery = { isPending: false, isSuccess: true, isError: false, data: { connections: [] } };
		mockSites = [];
		mockPrimarySiteId = null;
		mockRecordTracksEvent.mockClear();
	} );

	it( 'renders the site picker with admin sites and defaults to the primary site', () => {
		mockSites = [ adminSite( 1, 'alpha' ), adminSite( 2, 'beta' ), adminSite( 3, 'gamma' ) ];
		mockPrimarySiteId = 2;

		renderWithProvider( <ConnectionsNewView /> );

		const combobox = screen.getByRole( 'combobox', { name: /Choose a site/i } );
		expect( combobox ).toBeVisible();
		expect( combobox ).toHaveValue( 'beta' );

		const cta = screen.getByRole( 'link', { name: /Open ActivityPub settings/i } );
		expect( cta ).toHaveAttribute(
			'href',
			'https://beta.example/wp-admin/options-general.php?page=activitypub'
		);
	} );

	it( 'falls back to the first admin site when the primary site is not manageable', () => {
		mockSites = [ adminSite( 1, 'alpha' ), adminSite( 2, 'beta' ) ];
		mockPrimarySiteId = 99; // not in adminSites

		renderWithProvider( <ConnectionsNewView /> );

		expect( screen.getByRole( 'combobox', { name: /Choose a site/i } ) ).toHaveValue( 'alpha' );
		expect( screen.getByRole( 'link', { name: /Open ActivityPub settings/i } ) ).toHaveAttribute(
			'href',
			'https://alpha.example/wp-admin/options-general.php?page=activitypub'
		);
	} );

	it( 'updates the CTA href when the user picks a different site', async () => {
		const user = userEvent.setup();
		mockSites = [ adminSite( 1, 'alpha' ), adminSite( 2, 'beta' ) ];
		mockPrimarySiteId = 1;

		renderWithProvider( <ConnectionsNewView /> );

		const combobox = screen.getByRole( 'combobox', { name: /Choose a site/i } );
		await user.click( combobox );
		// ComboboxControl renders options as listbox items keyed on the
		// `value` we pass in (site ID as a string).
		const option = await screen.findByRole( 'option', { name: /beta/ } );
		await user.click( option );

		expect( screen.getByRole( 'link', { name: /Open ActivityPub settings/i } ) ).toHaveAttribute(
			'href',
			'https://beta.example/wp-admin/options-general.php?page=activitypub'
		);
	} );

	it( 'records a tracks event with the selected site_id when the CTA is opened', async () => {
		const user = userEvent.setup();
		mockSites = [ adminSite( 1, 'alpha' ), adminSite( 2, 'beta' ) ];
		mockPrimarySiteId = 2;

		renderWithProvider( <ConnectionsNewView /> );

		await user.click( screen.getByRole( 'link', { name: /Open ActivityPub settings/i } ) );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_connections_new_protocol_clicked',
			{ protocol: 'fediverse', site_id: 2, source: 'site_picker' }
		);
	} );

	it( 'disables the CTA when the selected site has no admin_url', async () => {
		const user = userEvent.setup();
		mockSites = [ adminSite( 1, 'alpha' ), adminSite( 2, 'beta', null ) ];
		mockPrimarySiteId = 2;

		renderWithProvider( <ConnectionsNewView /> );

		// @wordpress/components Button with `disabled` and an `href` renders
		// as a disabled button (not a link). `toBeDisabled` matches both the
		// `disabled` attribute and `aria-disabled="true"`.
		const cta = screen.getByRole( 'button', { name: /Open ActivityPub settings/i } );
		expect( cta ).toBeDisabled();

		await user.click( cta );
		expect( mockRecordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'does not render the picker while the connections query is pending', () => {
		mockQuery = { isPending: true, isSuccess: false, isError: false };
		mockSites = [ adminSite( 1, 'alpha' ), adminSite( 2, 'beta' ) ];

		renderWithProvider( <ConnectionsNewView /> );

		expect( screen.queryByRole( 'combobox', { name: /Choose a site/i } ) ).not.toBeInTheDocument();
	} );

	it( 'does not render the picker when the connections query errors', () => {
		mockQuery = { isPending: false, isSuccess: false, isError: true };
		mockSites = [ adminSite( 1, 'alpha' ), adminSite( 2, 'beta' ) ];

		renderWithProvider( <ConnectionsNewView /> );

		expect( screen.queryByRole( 'combobox', { name: /Choose a site/i } ) ).not.toBeInTheDocument();
	} );

	it( 'does not render the picker when the user already has a Fediverse connection', () => {
		mockQuery = {
			isPending: false,
			isSuccess: true,
			isError: false,
			data: { connections: [ { id: 1 } ] },
		};
		mockSites = [ adminSite( 1, 'alpha' ), adminSite( 2, 'beta' ) ];

		renderWithProvider( <ConnectionsNewView /> );

		expect( screen.queryByRole( 'combobox', { name: /Choose a site/i } ) ).not.toBeInTheDocument();
	} );

	it( 'deep-links the single-admin-site card directly without rendering the picker', () => {
		mockSites = [ adminSite( 42, 'solo' ) ];

		renderWithProvider( <ConnectionsNewView /> );

		// No site picker — there's only one site.
		expect( screen.queryByRole( 'combobox', { name: /Choose a site/i } ) ).not.toBeInTheDocument();

		// The Fediverse card title links straight to its wp-admin ActivityPub page.
		const fediverseLink = screen.getByRole( 'link', { name: 'Fediverse' } );
		expect( fediverseLink ).toHaveAttribute(
			'href',
			'https://solo.example/wp-admin/options-general.php?page=activitypub'
		);
	} );
} );

describe( 'ConnectionsNewView — Fediverse card heading', () => {
	beforeEach( () => {
		mockQuery = { isPending: false, isSuccess: true, isError: false, data: { connections: [] } };
		mockSites = [];
		mockPrimarySiteId = null;
		mockRecordTracksEvent.mockClear();
	} );

	it( 'shows the Fediverse card as the featured "recommended" surface', () => {
		renderWithProvider( <ConnectionsNewView /> );

		// The featured card carries the "Recommended for WordPress folks" badge.
		const badge = screen.getByText( /Recommended for WordPress folks/i );
		const card = badge.closest( '.connections-new__card' );
		expect( card ).not.toBeNull();
		expect(
			within( card as HTMLElement ).getByRole( 'heading', { name: /Fediverse/i } )
		).toBeVisible();
	} );
} );
