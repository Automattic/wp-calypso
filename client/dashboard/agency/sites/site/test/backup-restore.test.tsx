/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { HostingFeatures } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import AgencySiteBackupRestore from '../backup-restore';
import type { Site } from '@automattic/api-core';

const API_BASE = 'https://public-api.wordpress.com';
const siteId = 123;

jest.mock( '@wordpress/react-i18n', () => ( {
	useI18n: jest.fn(),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( { createSuccessNotice: jest.fn(), createErrorNotice: jest.fn() } ),
	useRegistry: () => ( {} ),
	combineReducers: jest.fn(),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createSelector: jest.fn( ( selector ) => selector ),
	store: jest.fn(),
	select: jest.fn(),
	dispatch: jest.fn(),
	keyedReducer: () => () => ( {} ),
} ) );

jest.mock(
	'../../../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context',
	() => ( {
		useFileBrowserContext: () => ( {
			fileBrowserState: {
				getCheckList: () => ( { includeList: [], excludeList: [], totalItems: 0 } ),
				getSelectedList: () => [],
			},
		} ),
	} )
);

jest.mock( '../../../../app/breadcrumbs', () => () => null );

jest.mock( '../../../../app/router/agency', () => ( {
	agencySiteBackupRestoreRoute: {
		fullPath: '/agency/sites/$siteSlug/backups/$rewindId/restore',
		useParams: () => ( { siteSlug: 'test-site', rewindId: '1792244294.123' } ),
	},
} ) );

const site = {
	ID: siteId,
	slug: 'test-site',
	name: 'Test Site',
	plan: {
		expired: false,
		features: { active: [ HostingFeatures.BACKUPS_SELF_SERVE, HostingFeatures.SCAN_SELF_SERVE ] },
	},
} as Site;

test( 'links to the agency restore route, not the sites one', async () => {
	nock( API_BASE ).get( '/rest/v1.1/sites/test-site' ).query( true ).reply( 200, site );
	nock( API_BASE )
		.get( `/rest/v1.4/sites/${ siteId }/settings` )
		.reply( 200, { settings: { gmt_offset: 0, timezone_string: '' } } );
	nock( API_BASE )
		.persist()
		.get( `/wpcom/v3/sites/${ siteId }/rewind/backups` )
		.query( true )
		.reply( 200, {
			ok: true,
			totalPages: 1,
			latest_without_known_threats: 1792240000,
			backups: [
				{
					object: {
						backup_period: '1792244294',
						known_threats: {
							malware: 3,
							database: 0,
							vulnerable: 0,
							ignored: 0,
							flagged: 3,
							fixed: 0,
						},
					},
				},
			],
		} );
	nock( API_BASE )
		.persist()
		.get( /rewind\/backups\/.*/ )
		.query( true )
		.reply( 200, {} );

	render( <AgencySiteBackupRestore /> );

	expect( await screen.findByRole( 'link', { name: /^Restore .+ instead$/ } ) ).toHaveAttribute(
		'href',
		expect.stringContaining( '/agency/sites/test-site/backups/1792240000/restore' )
	);
} );
