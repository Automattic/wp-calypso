/**
 * @vitest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import SiteBackupRestoreSuccess from '../success';
import type { Site } from '@automattic/api-core';

const site = { ID: 1, URL: 'https://example.wordpress.com' } as Site;

describe( '<SiteBackupRestoreSuccess>', () => {
	test( 'links to the restored site in a new tab', async () => {
		const { recordTracksEvent } = render(
			<SiteBackupRestoreSuccess restorePointDate="April 6, 2027" site={ site } />
		);

		const link = screen.getByRole( 'link', { name: 'View website (opens in a new tab)' } );
		expect( link ).toHaveAttribute( 'href', 'https://example.wordpress.com' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );

		link.addEventListener( 'click', ( event ) => event.preventDefault() );
		await userEvent.click( link );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_backups_restore_view_website'
		);
	} );
} );
