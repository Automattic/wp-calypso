/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import { getStatusField } from '../status-field';
import type { AgencySite } from '@automattic/api-core';
import type { NormalizedField } from '@wordpress/dataviews';

function renderStatus( item: AgencySite ) {
	const field = getStatusField();
	const Cell = field.render;
	if ( ! Cell ) {
		throw new Error( 'status has no render' );
	}
	return render( <Cell item={ item } field={ field as NormalizedField< AgencySite > } /> );
}

const site = { blog_id: 1, url: 'example.com' } as AgencySite;

describe( 'getStatusField', () => {
	test( 'lists every issue the site has', async () => {
		renderStatus( {
			...site,
			monitor_settings: { monitor_active: true, monitor_site_status: false },
			monitor_last_status_change: '2026-10-19 08:00:00',
			has_backup: true,
			latest_backup_status: 'rewind_backup_error',
			awaiting_plugin_updates: [ 'akismet', 'jetpack', 'woocommerce' ],
		} );

		expect( await screen.findByText( 'Site down' ) ).toBeVisible();
		expect( screen.getByText( 'Backup failed' ) ).toBeVisible();
		expect( screen.getByText( '3 plugin updates' ) ).toBeVisible();
	} );

	test( 'does not call a site down before the monitor has checked it', async () => {
		renderStatus( {
			...site,
			monitor_settings: { monitor_active: true, monitor_site_status: false },
			monitor_last_status_change: '1970-01-01 00:00:00',
		} );

		expect( await screen.findByText( '-' ) ).toBeVisible();
		expect( screen.queryByText( 'Site down' ) ).not.toBeInTheDocument();
	} );

	test( 'ignores threats on a site without Scan', async () => {
		renderStatus( { ...site, has_scan: false, latest_scan_threats_found: [ 'malware' ] } );

		expect( await screen.findByText( '-' ) ).toBeVisible();
	} );
} );
