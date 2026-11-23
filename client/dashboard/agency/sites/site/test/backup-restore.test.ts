/**
 * @vitest-environment jsdom
 */

import '@testing-library/jest-dom';
import { HostingFeatures } from '@automattic/api-core';
import { createRootRoute, createRoute } from '@tanstack/react-router';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { vi } from 'vitest';
import { buildRealRoutes, renderAtPath } from '../../../../sites/backups/test/render-at-path';
import AgencySiteBackupRestore from '../backup-restore';
import type { Site } from '@automattic/api-core';

const API_BASE = 'https://public-api.wordpress.com';
const siteId = 123;

vi.mock( '@wordpress/react-i18n', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		useI18n: vi.fn(),
	} )
);

vi.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( { createSuccessNotice: vi.fn(), createErrorNotice: vi.fn() } ),
	useRegistry: () => ( {} ),
	combineReducers: vi.fn(),
	createReduxStore: vi.fn(),
	register: vi.fn(),
	createSelector: vi.fn( ( selector ) => selector ),
	store: vi.fn(),
	select: vi.fn(),
	dispatch: vi.fn(),
	keyedReducer: () => () => ( {} ),
} ) );

vi.mock(
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

vi.mock( '../../../../app/breadcrumbs', () => ( { default: () => null } ) );

beforeAll( () => buildRealRoutes( 'agency' ) );

// The agency restore page's route, at the app's path under the pathless `agency` layout, without its
// loaders. The clean backup's restore page is registered so the link to it resolves.
function agencyRestoreRoutes() {
	const root = createRootRoute();
	const agency = createRoute( { getParentRoute: () => root, id: 'agency' } );
	const restore = createRoute( {
		getParentRoute: () => agency,
		path: 'sites/$siteSlug/backups/$rewindId/restore',
		component: AgencySiteBackupRestore,
	} );

	return root.addChildren( [ agency.addChildren( [ restore ] ) ] );
}

const site = {
	ID: siteId,
	slug: 'test-site',
	name: 'Test Site',
	plan: {
		expired: false,
		features: { active: [ HostingFeatures.BACKUPS_SELF_SERVE, HostingFeatures.SCAN_SELF_SERVE ] },
	},
} as Site;

test( 'links to the agency restore page of the latest backup without known threats', async () => {
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

	renderAtPath( agencyRestoreRoutes(), '/sites/test-site/backups/1792244294.123/restore' );

	expect(
		await screen.findByRole( 'link', { name: 'latest backup without known threats' } )
	).toHaveAttribute( 'href', '/sites/test-site/backups/1792240000/restore' );
} );
