/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { StackedNotification } from '../stacked-notification';
import type { StackedRow } from '../group-notifications';
import type { AtmosphereNotification } from '@automattic/api-core';

jest.mock( '@automattic/calypso-router', () => jest.fn() );
const pageMock = jest.mocked( page );

function makeMember(
	id: string,
	overrides: Partial< AtmosphereNotification > = {}
): AtmosphereNotification {
	return {
		id,
		protocol_type: overrides.protocol_type ?? 'like',
		canonical_type: overrides.canonical_type ?? 'like',
		actor: overrides.actor ?? {
			handle: `${ id }.bsky.social`,
			display_name: id.toUpperCase(),
			avatar_url: null,
			profile_uri: `at://did:plc:${ id }`,
		},
		target: overrides.target ?? {
			kind: 'post',
			uri: 'at://post/p1',
			excerpt: 'hi',
		},
		target_url: overrides.target_url ?? 'https://bsky.app/profile/me/post/p1',
		created_at: overrides.created_at ?? '2026-05-12T12:00:00Z',
		is_read: overrides.is_read ?? false,
	};
}

function makeLikeStack( count: number ): StackedRow {
	const members = Array.from( { length: count }, ( _, i ) => makeMember( `m${ i }` ) );
	return {
		kind: 'stack',
		groupKey: 'like:at://post/p1',
		canonicalType: 'like',
		members,
		newestCreatedAt: members[ 0 ].created_at ?? '',
		isUnread: true,
		target: members[ 0 ].target,
		targetUrl: members[ 0 ].target_url,
	};
}

function makeFollowStack( count: number ): StackedRow {
	const members = Array.from( { length: count }, ( _, i ) =>
		makeMember( `f${ i }`, {
			canonical_type: 'follow',
			protocol_type: 'follow',
			target: null,
			target_url: `https://bsky.app/profile/f${ i }`,
		} )
	);
	return {
		kind: 'stack',
		groupKey: 'follow',
		canonicalType: 'follow',
		members,
		newestCreatedAt: members[ 0 ].created_at ?? '',
		isUnread: false,
		target: null,
		targetUrl: members[ 0 ].target_url,
	};
}

describe( 'StackedNotification', () => {
	beforeEach( () => {
		pageMock.mockReset();
	} );

	it( 'renders a like stack of 2 with both names and no "others"', () => {
		renderWithProvider( <StackedNotification stack={ makeLikeStack( 2 ) } /> );
		expect( screen.getByText( /M0 and M1 liked your post/i ) ).toBeVisible();
	} );

	it( 'renders a like stack of 5 with first 2 names and "and 3 others"', () => {
		renderWithProvider( <StackedNotification stack={ makeLikeStack( 5 ) } /> );
		expect( screen.getByText( /M0, M1 and 3 others liked your post/i ) ).toBeVisible();
	} );

	it( 'renders a like stack of 3 with the singular "1 other"', () => {
		renderWithProvider( <StackedNotification stack={ makeLikeStack( 3 ) } /> );
		expect( screen.getByText( /M0, M1 and 1 other liked your post/i ) ).toBeVisible();
	} );

	it( 'shows up to 3 avatars + a "+N" badge for >3 members', () => {
		const { container } = renderWithProvider(
			<StackedNotification stack={ makeLikeStack( 7 ) } />
		);
		const avatars = container.querySelectorAll( '.social-notifications-stack__avatar' );
		expect( avatars.length ).toBe( 3 );
		expect( screen.getByText( /\+4/ ) ).toBeVisible();
	} );

	it( 'a like stack is an anchor to the target URL', () => {
		renderWithProvider( <StackedNotification stack={ makeLikeStack( 3 ) } /> );
		const link = screen.getByRole( 'link', { name: /liked your post/i } );
		expect( link ).toHaveAttribute( 'href', 'https://bsky.app/profile/me/post/p1' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', expect.stringContaining( 'noopener' ) );
	} );

	it( 'routes a non-follow stack in-app when getInAppUrl returns a path', async () => {
		const user = userEvent.setup();
		renderWithProvider(
			<StackedNotification
				stack={ makeLikeStack( 3 ) }
				getInAppUrl={ () => '/reader/atmosphere/42/thread/did:plc:abc/post1' }
			/>
		);
		const link = screen.getByRole( 'link', { name: /liked your post/i } );
		expect( link ).toHaveAttribute( 'href', '/reader/atmosphere/42/thread/did:plc:abc/post1' );
		expect( link ).not.toHaveAttribute( 'target' );
		await user.click( link );
		expect( pageMock ).toHaveBeenCalledWith( '/reader/atmosphere/42/thread/did:plc:abc/post1' );
	} );

	it( 'defers to the browser on modifier-click of a stacked in-app link', async () => {
		const user = userEvent.setup();
		renderWithProvider(
			<StackedNotification
				stack={ makeLikeStack( 3 ) }
				getInAppUrl={ () => '/reader/atmosphere/42/thread/did:plc:abc/post1' }
			/>
		);
		await user.keyboard( '[ControlLeft>]' );
		await user.click( screen.getByRole( 'link', { name: /liked your post/i } ) );
		await user.keyboard( '[/ControlLeft]' );
		expect( pageMock ).not.toHaveBeenCalled();
	} );

	it( 'a follow stack is a button (not a link) with aria-expanded=false initially', () => {
		renderWithProvider( <StackedNotification stack={ makeFollowStack( 3 ) } /> );
		const toggle = screen.getByRole( 'button', { name: /followed you/i } );
		expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
		expect( screen.queryAllByRole( 'link' ) ).toHaveLength( 0 );
	} );

	it( 'toggles expansion and shows per-member child links on click', async () => {
		const user = userEvent.setup();
		const onExpandedChange = jest.fn();
		renderWithProvider(
			<StackedNotification stack={ makeFollowStack( 3 ) } onExpandedChange={ onExpandedChange } />
		);
		const toggle = screen.getByRole( 'button', { name: /followed you/i } );
		await user.click( toggle );
		expect( toggle ).toHaveAttribute( 'aria-expanded', 'true' );

		const links = screen.getAllByRole( 'link' );
		expect( links ).toHaveLength( 3 );
		expect( links[ 0 ] ).toHaveAttribute( 'href', 'https://bsky.app/profile/f0' );

		expect( onExpandedChange ).toHaveBeenCalledWith( true, 3 );

		await user.click( toggle );
		expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
		expect( onExpandedChange ).toHaveBeenLastCalledWith( false, 3 );
	} );

	it( 'truncates follow stacks above 50 members', async () => {
		const user = userEvent.setup();
		renderWithProvider( <StackedNotification stack={ makeFollowStack( 60 ) } /> );
		await user.click( screen.getByRole( 'button', { name: /followed you/i } ) );

		const links = screen.getAllByRole( 'link' );
		expect( links ).toHaveLength( 50 );
	} );
} );
