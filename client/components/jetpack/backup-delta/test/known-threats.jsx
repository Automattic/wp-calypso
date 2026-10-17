/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import BackupDelta from '../index';

jest.mock( 'calypso/state/selectors/site-has-feature' );
jest.mock( 'calypso/components/activity-card', () => ( {
	__esModule: true,
	default: ( { activity } ) => <div data-testid="activity-card">{ activity.activityId }</div>,
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	...jest.requireActual( 'calypso/state/ui/selectors' ),
	getSelectedSiteId: () => 123,
	getSelectedSiteSlug: () => 'example.wordpress.com',
} ) );

const BASE = 'https://public-api.wordpress.com';
const LIST_PATH = '/wpcom/v3/sites/123/rewind/backups';

const backup = ( period, flagged ) => ( {
	status: 'finished',
	is_rewindable: true,
	summary: '',
	object: {
		backup_period: String( period ),
		...( flagged
			? {
					known_threats: {
						malware: flagged,
						database: 0,
						vulnerable: 0,
						ignored: 0,
						flagged,
						fixed: 0,
					},
				}
			: {} ),
	},
} );

describe( 'BackupDelta known threats', () => {
	beforeEach( () => {
		siteHasFeature.mockReturnValue( true );
	} );
	afterEach( () => nock.cleanAll() );

	it( 'badges only flagged backups using a single shared page request', async () => {
		const scope = nock( BASE )
			.get( LIST_PATH )
			.query( true )
			.once()
			.reply( 200, {
				ok: true,
				totalItems: 2,
				totalPages: 1,
				page: 1,
				itemsPerPage: 100,
				backups: [ backup( 200, 3 ), backup( 100, 0 ) ],
			} );

		renderWithProvider(
			<BackupDelta
				isToday
				realtimeBackups={ [
					{ activityId: 'a1', rewindId: '200.5' },
					{ activityId: 'a2', rewindId: '100.5' },
				] }
			/>
		);

		expect( await screen.findAllByText( 'Known threats (3)' ) ).toHaveLength( 1 );
		expect( screen.getAllByTestId( 'activity-card' ) ).toHaveLength( 2 );
		await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );
		expect( scope.isDone() ).toBe( true );
		expect( scope.pendingMocks() ).toEqual( [] );
		expect( nock.pendingMocks() ).toEqual( [] );
	} );

	it( 'still renders the empty-day message without realtime backups', () => {
		renderWithProvider( <BackupDelta isToday={ false } realtimeBackups={ [] } /> );
		expect(
			screen.getByText( 'There were no changes on this day. Your daily backup is above.' )
		).toBeVisible();
	} );
} );
