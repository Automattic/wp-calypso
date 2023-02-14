import { getEstimatedCurrentSiteSize, getSpaceNeededInBytes } from '../hooks';

// Constants
const GB_IN_BYTES = 2 ** 30;
const TB_IN_BYTES = 2 ** 40;

describe( 'hooks', () => {
	describe( 'useEstimatedCurrentSiteSize', () => {
		it.each( [
			[ 0, 0 ],
			[ GB_IN_BYTES * 1.25, GB_IN_BYTES ],
			[ TB_IN_BYTES * 1.25, TB_IN_BYTES ],
		] )(
			'should return %d estimated size in bytes, given the last backup size of %d',
			( expectedEstimation, lastBackupSize ) => {
				const result = getEstimatedCurrentSiteSize( lastBackupSize );
				expect( result ).toBe( expectedEstimation );
			}
		);
	} );

	describe( 'getSpaceNeededInBytes', () => {
		it.each( [
			[ 0, 0, 0 ],
			[ 9395240960, 1342177280, 7 ],
			[ 40265318400, 1342177280, 30 ],
			[ 161061273600, 1342177280, 120 ],
			[ 489894707200, 1342177280, 365 ],
		] )(
			'should return %d as space needed in bytes, given the %d current site size in bytes and %d retention days',
			( expectedSpaceNeeded, currentSiteSizeInBytes, desiredRetentionDays ) => {
				const result = getSpaceNeededInBytes( currentSiteSizeInBytes, desiredRetentionDays );
				expect( result ).toBe( expectedSpaceNeeded );
			}
		);
	} );
} );
