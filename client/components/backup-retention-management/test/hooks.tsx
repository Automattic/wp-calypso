import { renderHook } from '@testing-library/react-hooks';
import getBackupCurrentSiteSize from 'calypso/state/rewind/selectors/get-backup-current-site-size';
import getRewindBytesAvailable from 'calypso/state/rewind/selectors/get-rewind-bytes-available';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import {
	useEstimatedCurrentSiteSize,
	useEstimateSpaceNeeded,
	usePrepareRetentionOptions,
} from '../hooks';

// Constants
const MOCK_SITE_ID = 123456;
const MB_IN_BYTES = 2 ** 20;
const GB_IN_BYTES = 2 ** 30;
const TB_IN_BYTES = 2 ** 40;

// Mock useSelector
jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn( ( func ) => func() ),
} ) );

// Mock selectors
jest.mock( 'calypso/state/ui/selectors/get-selected-site-id', () => jest.fn( () => MOCK_SITE_ID ) );
jest.mock( 'calypso/state/rewind/selectors/get-backup-current-site-size', () => jest.fn() );
jest.mock( 'calypso/state/rewind/selectors/get-rewind-bytes-available', () => jest.fn() );

// Fixtures
const RETENTION_OPTIONS_FIXTURES = {
	CURRENT_PLAN: {
		label: '30 days',
		desiredRetentionDays: 30,
		currentRetentionPlan: 30,
		checked: false,
	},
	DIFFERENT_PLAN: {
		label: '120 days',
		desiredRetentionDays: 120,
		currentRetentionPlan: 30,
		checked: false,
	},
};

// Helper functions
function renderPrepareRetentionOptionsHook(
	label: string,
	desiredRetentionDays: number,
	retentionPlan: number,
	checked: boolean
) {
	const { result } = renderHook( () =>
		usePrepareRetentionOptions( label, desiredRetentionDays, retentionPlan, checked )
	);

	return result.current;
}

describe( 'hooks', () => {
	describe( 'useEstimatedCurrentSiteSize', () => {
		beforeAll( () => {
			( getSelectedSiteId as jest.Mock ).mockReturnValue( MOCK_SITE_ID );
		} );

		it.each( [
			[ 0, 0 ],
			[ GB_IN_BYTES * 1.25, GB_IN_BYTES ],
			[ TB_IN_BYTES * 1.25, TB_IN_BYTES ],
		] )(
			'should return %d estimated size in bytes, given the last backup size of %d',
			( expectedEstimation, lastBackupSize ) => {
				( getBackupCurrentSiteSize as jest.Mock ).mockImplementation( () => lastBackupSize );
				const { result } = renderHook( () => useEstimatedCurrentSiteSize() );
				expect( result.current ).toBe( expectedEstimation );
			}
		);
	} );

	describe( 'useEstimateSpaceNeeded', () => {
		it.each( [
			[ 0, 0, 0 ],
			[ 9395240960, 1342177280, 7 ],
			[ 40265318400, 1342177280, 30 ],
			[ 161061273600, 1342177280, 120 ],
			[ 489894707200, 1342177280, 365 ],
		] )(
			'should return %d as space needed in bytes, given the %d current site size in bytes and %d retention days',
			( expectedSpaceNeeded, currentSiteSizeInBytes, desiredRetentionDays ) => {
				const { result } = renderHook( () =>
					useEstimateSpaceNeeded( currentSiteSizeInBytes, desiredRetentionDays )
				);
				expect( result.current ).toBe( expectedSpaceNeeded );
			}
		);
	} );

	describe( 'usePrepareRetentionOptions', () => {
		it( 'should return a retention option that is the current plan and requires upgrade when spaceNeeded is higher than storage limit', () => {
			( getBackupCurrentSiteSize as jest.Mock ).mockImplementation( () => GB_IN_BYTES * 20 );
			( getRewindBytesAvailable as jest.Mock ).mockImplementation( () => GB_IN_BYTES * 10 );

			const input = RETENTION_OPTIONS_FIXTURES.CURRENT_PLAN;

			const output = renderPrepareRetentionOptionsHook(
				input.label,
				input.desiredRetentionDays,
				input.currentRetentionPlan,
				input.checked
			);

			const expectedOutput = {
				label: input.label,
				spaceNeeded: '750GB',
				upgradeRequired: true,
				isCurrentPlan: true,
				value: input.desiredRetentionDays,
				checked: input.checked,
			};

			expect( output ).toStrictEqual( expectedOutput );
		} );

		it( 'should return a retention option that is the current plan and not requires upgrade when spaceNeeded is lower than storage limit', () => {
			( getBackupCurrentSiteSize as jest.Mock ).mockImplementation( () => MB_IN_BYTES );
			( getRewindBytesAvailable as jest.Mock ).mockImplementation( () => GB_IN_BYTES * 10 );

			const input = RETENTION_OPTIONS_FIXTURES.CURRENT_PLAN;

			const output = renderPrepareRetentionOptionsHook(
				input.label,
				input.desiredRetentionDays,
				input.currentRetentionPlan,
				input.checked
			);

			const expectedOutput = {
				label: input.label,
				spaceNeeded: '0.0GB',
				upgradeRequired: false,
				isCurrentPlan: true,
				value: input.desiredRetentionDays,
				checked: input.checked,
			};

			expect( output ).toStrictEqual( expectedOutput );
		} );

		it( 'should return a retention option that is not the current plan and requires upgrade when spaceNeeded is higher than storage limit', () => {
			( getBackupCurrentSiteSize as jest.Mock ).mockImplementation( () => GB_IN_BYTES * 20 );
			( getRewindBytesAvailable as jest.Mock ).mockImplementation( () => GB_IN_BYTES * 10 );

			const input = RETENTION_OPTIONS_FIXTURES.DIFFERENT_PLAN;

			const output = renderPrepareRetentionOptionsHook(
				input.label,
				input.desiredRetentionDays,
				input.currentRetentionPlan,
				input.checked
			);

			const expectedOutput = {
				label: input.label,
				spaceNeeded: '2.9TB',
				upgradeRequired: true,
				isCurrentPlan: false,
				value: input.desiredRetentionDays,
				checked: input.checked,
			};

			expect( output ).toStrictEqual( expectedOutput );
		} );

		it( 'should return a retention option that is not the current plan and not requires upgrade when spaceNeeded is lower than storage limit', () => {
			( getBackupCurrentSiteSize as jest.Mock ).mockImplementation( () => MB_IN_BYTES );
			( getRewindBytesAvailable as jest.Mock ).mockImplementation( () => GB_IN_BYTES * 10 );

			const input = RETENTION_OPTIONS_FIXTURES.DIFFERENT_PLAN;

			const output = renderPrepareRetentionOptionsHook(
				input.label,
				input.desiredRetentionDays,
				input.currentRetentionPlan,
				input.checked
			);

			const expectedOutput = {
				label: input.label,
				spaceNeeded: '0.1GB',
				upgradeRequired: false,
				isCurrentPlan: false,
				value: input.desiredRetentionDays,
				checked: input.checked,
			};

			expect( output ).toStrictEqual( expectedOutput );
		} );
	} );
} );
