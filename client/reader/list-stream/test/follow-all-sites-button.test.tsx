/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { FollowAllSitesButton } from '../follow-all-sites-button';
import type { PublicListItem } from '../use-public-list-query';

const mockFollow = jest.fn( ( feedUrl: string ) => ( {
	type: 'READER_FOLLOW',
	payload: { feedUrl },
} ) );
jest.mock( 'calypso/state/reader/follows/actions', () => ( {
	follow: ( feedUrl: string ) => mockFollow( feedUrl ),
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( event: string, props: Record< string, unknown > ) => ( {
		type: 'ANALYTICS_EVENT_RECORD',
		meta: { analytics: [ { type: 'mc', payload: { stat: event, ...props } } ] },
	} ),
} ) );

const mockItems: PublicListItem[] = [
	{
		blog_id: 1,
		feed_id: 100,
		site_name: 'Site One',
		site_url: 'https://siteone.com',
		fediverse_handle: null,
		fediverse_handle_url: null,
	},
	{
		blog_id: 2,
		feed_id: 200,
		site_name: 'Site Two',
		site_url: 'https://sitetwo.com',
		fediverse_handle: null,
		fediverse_handle_url: null,
	},
];

describe( 'FollowAllSitesButton', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'renders the button with site count', () => {
		renderWithProvider( <FollowAllSitesButton items={ mockItems } followSource="reader-list" /> );

		expect( screen.getByRole( 'button', { name: /follow all/i } ) ).toBeVisible();
	} );

	test( 'dispatches follow actions for each site on click when logged in', async () => {
		const user = userEvent.setup();

		renderWithProvider( <FollowAllSitesButton items={ mockItems } followSource="reader-list" />, {
			initialState: {
				currentUser: { id: 1 },
			},
		} );

		await user.click( screen.getByRole( 'button', { name: /follow all/i } ) );

		expect( mockFollow ).toHaveBeenCalledTimes( 2 );
		expect( mockFollow ).toHaveBeenNthCalledWith( 1, 'https://siteone.com' );
		expect( mockFollow ).toHaveBeenNthCalledWith( 2, 'https://sitetwo.com' );
	} );

	test( 'renders nothing when items is empty', () => {
		const { container } = renderWithProvider(
			<FollowAllSitesButton items={ [] } followSource="reader-list" />
		);
		expect( container ).toBeEmptyDOMElement();
	} );
} );
