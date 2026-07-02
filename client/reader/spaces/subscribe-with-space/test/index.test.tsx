/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SubscribeWithSpaceButton } from '../index';
import type { ReadSpace, ReadSpaceDetails } from '@automattic/api-core';

const mockRecordReaderTracksEvent = jest.fn().mockReturnValue( { type: 'MOCK_TRACKS_EVENT' } );
jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => mockRecordReaderTracksEvent( ...args ),
} ) );

let mockFlagEnabled = true;
jest.mock( '@automattic/calypso-config', () => {
	const configFn = jest.fn();
	const isEnabled = ( flag: string ) => ( flag === 'reader/spaces' ? mockFlagEnabled : false );
	return {
		__esModule: true,
		default: Object.assign( configFn, { isEnabled } ),
		isEnabled,
	};
} );

// SiteIcon pulls in the sites Redux data-layer (QuerySites); stub it so the picker
// tests don't fire a real site request.
jest.mock( 'calypso/blocks/site-icon', () => ( {
	SiteIcon: () => null,
} ) );

let mockIsSubscribed = false;
let mockIsSubscribedLoading = false;
const mockFollowSite = jest.fn();
let mockFollowPending = false;
jest.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	useIsSubscribed: () => mockIsSubscribed,
	useIsSubscribedStatus: () => ( {
		isSubscribed: mockIsSubscribed,
		isLoading: mockIsSubscribedLoading,
	} ),
	useFollowSite: () => ( { mutate: mockFollowSite, isPending: mockFollowPending } ),
	useUnfollowSite: () => ( { mutate: jest.fn(), isPending: false } ),
	useSiteSubscriptionForFeed: () => undefined,
	getFollowingSource: () => 'reader_full_post',
} ) );

const mockUpdateSpace = jest.fn().mockResolvedValue( undefined );
let mockSpaces: ReadSpace[] = [];
let mockDetailsById: Record< string, ReadSpaceDetails | undefined > = {};
let mockDetailsLoading = false;
let mockDetailsError = false;
jest.mock( 'calypso/reader/data/spaces', () => ( {
	useSpaces: () => mockSpaces,
	useSpacesDetails: () => ( {
		byId: mockDetailsById,
		isLoading: mockDetailsLoading,
		isError: mockDetailsError,
	} ),
	useUpdateSpace: () => ( { mutateAsync: mockUpdateSpace, isPending: false } ),
} ) );

const space: ReadSpace = {
	id: '10',
	name: 'Work',
	layout: { color: 'none', icon: 'inbox' },
};

const props = {
	siteUrl: 'https://blog.example/feed',
	feedId: 456,
	siteId: 123,
};

beforeEach( () => {
	mockFlagEnabled = true;
	mockIsSubscribed = false;
	mockIsSubscribedLoading = false;
	mockFollowPending = false;
	mockSpaces = [ space ];
	mockDetailsById = { [ space.id ]: { ...space, sources: [], tags: [], languages: [] } };
	mockDetailsLoading = false;
	mockDetailsError = false;
	mockFollowSite.mockClear();
	mockUpdateSpace.mockClear();
	mockRecordReaderTracksEvent.mockClear();
} );

const openPicker = async ( user: ReturnType< typeof userEvent.setup > ) => {
	await user.click( screen.getByRole( 'button', { name: 'Move site to a space' } ) );
	return screen.findByRole( 'dialog', { name: 'Move site to a space' } );
};

it( 'shows a loading skeleton while the space details are loading', async () => {
	mockDetailsLoading = true;
	const user = userEvent.setup();
	renderWithProvider( <SubscribeWithSpaceButton { ...props } /> );

	await openPicker( user );

	expect( screen.getByRole( 'status', { name: 'Loading your spaces' } ) ).toBeVisible();
	// The interactive space rows are not rendered while loading.
	expect( screen.queryByRole( 'button', { name: 'Add to Work' } ) ).not.toBeInTheDocument();
} );

it( 'renders only the plain follow button when the flag is off', () => {
	mockFlagEnabled = false;
	renderWithProvider( <SubscribeWithSpaceButton { ...props } /> );

	expect( screen.getByRole( 'button', { name: 'Subscribe' } ) ).toBeVisible();
	expect(
		screen.queryByRole( 'button', { name: 'Move site to a space' } )
	).not.toBeInTheDocument();
} );

it( 'renders the spaces button alongside subscribe when the flag is on', () => {
	renderWithProvider( <SubscribeWithSpaceButton { ...props } /> );

	expect( screen.getByRole( 'button', { name: 'Subscribe' } ) ).toBeVisible();
	expect( screen.getByRole( 'button', { name: 'Move site to a space' } ) ).toBeVisible();
} );

it( 'subscribes and opens the picker when the spaces button is clicked', async () => {
	const user = userEvent.setup();
	renderWithProvider( <SubscribeWithSpaceButton { ...props } /> );

	await openPicker( user );

	expect( mockFollowSite ).toHaveBeenCalledWith( {
		feedUrl: 'https://blog.example/feed',
		source: 'reader_full_post',
	} );
	expect( screen.getByRole( 'listitem', { name: 'Work' } ) ).toBeVisible();
} );

it( 'tracks when the full post spaces button is clicked', async () => {
	const user = userEvent.setup();
	renderWithProvider( <SubscribeWithSpaceButton { ...props } /> );

	await openPicker( user );

	expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
		'calypso_reader_subscribe_space_button_clicked',
		{
			blog_id: 123,
			feed_id: 456,
			source: 'full_post_action_bar',
		}
	);
} );

it( 'does not re-subscribe when the feed is already subscribed', async () => {
	mockIsSubscribed = true;
	const user = userEvent.setup();
	renderWithProvider( <SubscribeWithSpaceButton { ...props } /> );

	await openPicker( user );

	expect( mockFollowSite ).not.toHaveBeenCalled();
} );

it( 'waits for subscription state before subscribing from the picker', async () => {
	mockIsSubscribedLoading = true;
	const user = userEvent.setup();
	renderWithProvider( <SubscribeWithSpaceButton { ...props } /> );

	await openPicker( user );

	expect( mockFollowSite ).not.toHaveBeenCalled();
} );

it( 'only applies the added space on Save (not while toggling), via the update endpoint', async () => {
	mockIsSubscribed = true;
	const user = userEvent.setup();
	renderWithProvider( <SubscribeWithSpaceButton { ...props } /> );

	await openPicker( user );
	await user.click( await screen.findByRole( 'button', { name: 'Add to Work' } ) );

	// Toggling the row must not write anything yet.
	expect( mockUpdateSpace ).not.toHaveBeenCalled();

	await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

	expect( mockUpdateSpace ).toHaveBeenCalledWith( {
		spaceId: '10',
		params: { feeds: [ 456 ] },
	} );
} );

it( 'removes the feed from a space on Save by replacing its feed list', async () => {
	mockIsSubscribed = true;
	mockDetailsById = {
		[ space.id ]: {
			...space,
			tags: [],
			languages: [],
			sources: [
				{
					feedId: 456,
					feedUrl: 'https://blog.example/feed',
					blogId: 123,
					name: null,
					siteIcon: null,
				},
			],
		},
	};
	const user = userEvent.setup();
	renderWithProvider( <SubscribeWithSpaceButton { ...props } /> );

	await openPicker( user );
	await user.click( await screen.findByRole( 'button', { name: 'Remove from Work' } ) );
	await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

	expect( mockUpdateSpace ).toHaveBeenCalledWith( {
		spaceId: '10',
		params: { feeds: [] },
	} );
} );

it( 'discards the draft on Cancel without writing anything', async () => {
	mockIsSubscribed = true;
	const user = userEvent.setup();
	renderWithProvider( <SubscribeWithSpaceButton { ...props } /> );

	await openPicker( user );
	await user.click( await screen.findByRole( 'button', { name: 'Add to Work' } ) );
	await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

	expect( mockUpdateSpace ).not.toHaveBeenCalled();
	expect(
		screen.queryByRole( 'dialog', { name: 'Move site to a space' } )
	).not.toBeInTheDocument();
} );

it( 'disables Save until a change is made', async () => {
	mockIsSubscribed = true;
	const user = userEvent.setup();
	renderWithProvider( <SubscribeWithSpaceButton { ...props } /> );

	await openPicker( user );

	expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeDisabled();

	await user.click( await screen.findByRole( 'button', { name: 'Add to Work' } ) );

	expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeEnabled();
} );

it( 'keeps the space rows and Save disabled until the feed is subscribed', async () => {
	// The feed is not subscribed yet (the open-time follow hasn't resolved).
	mockIsSubscribed = false;
	const user = userEvent.setup();
	renderWithProvider( <SubscribeWithSpaceButton { ...props } /> );

	await openPicker( user );

	expect( await screen.findByRole( 'button', { name: 'Add to Work' } ) ).toBeDisabled();
	expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeDisabled();
} );

it( 'does not allow editing when space details fail to load', async () => {
	mockIsSubscribed = true;
	mockDetailsById = { [ space.id ]: undefined };
	mockDetailsError = true;
	const user = userEvent.setup();
	renderWithProvider( <SubscribeWithSpaceButton { ...props } /> );

	await openPicker( user );

	expect( await screen.findByRole( 'button', { name: 'Add to Work' } ) ).toBeDisabled();
	expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeDisabled();
} );

it( 'shows the empty state when the user has no spaces', async () => {
	mockSpaces = [];
	const user = userEvent.setup();
	renderWithProvider( <SubscribeWithSpaceButton { ...props } /> );

	await openPicker( user );

	expect( await screen.findByText( 'You don’t have any spaces yet.' ) ).toBeVisible();
} );
