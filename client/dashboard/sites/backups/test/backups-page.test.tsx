/**
 * @jest-environment jsdom
 */

import { useNavigate } from '@tanstack/react-router';
import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { BackupsPage } from '../backups-page';
import type { Site } from '@automattic/api-core';

const site = { ID: 123, slug: 'test-site' } as Site;

function BackupDetailsPage() {
	const navigate = useNavigate();
	return (
		<BackupsPage
			site={ site }
			rewindId="123"
			navigation={ {
				selectBackup: () => {
					void navigate( { to: '/backups', search: ( prev: Record< string, unknown > ) => prev } );
				},
				requestRestore: () => {},
				requestDownload: () => {},
			} }
		/>
	);
}

describe( '<BackupsPage>', () => {
	test( 'retains selected dates when navigating back to the backup list', async () => {
		window.history.replaceState( { key: 'backup-test', __TSR_index: 1 }, '', '/?keep=present' );
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.1/me/preferences' )
			.reply( 200, { calypso_preferences: {} } );
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.4/sites/123/settings' )
			.reply( 200, { settings: { gmt_offset: 0, timezone_string: '' } } );
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/wpcom/v2/sites/123/rewind/backups' )
			.query( true )
			.reply( 200, [] );
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/wpcom/v2/sites/123/activity/rewindable' )
			.query( true )
			.reply( 200, { current: { orderedItems: [] }, totalItems: 0, totalPages: 0 } );
		const { router } = render( <BackupDetailsPage /> );
		router.history.block( { blockerFn: async () => false, enableBeforeUnload: false } );
		await userEvent.click( await screen.findByRole( 'button', { name: /^Date range:/ } ) );
		await userEvent.click(
			within( await screen.findByRole( 'listbox', { name: 'Date range presets' } ) ).getByRole(
				'option',
				{ name: 'Last 7 days' }
			)
		);
		const today = Math.floor( Date.now() / 86400000 ) * 86400;
		await waitFor( () => {
			expect( router.state.location.pathname ).toBe( '/backups' );
			expect( router.state.location.search ).toMatchObject( {
				from: today - 6 * 86400,
				to: today + 86399,
				keep: 'present',
			} );
			expect( new URLSearchParams( window.location.search ).get( 'from' ) ).toBe(
				String( today - 6 * 86400 )
			);
		} );
	} );
} );
