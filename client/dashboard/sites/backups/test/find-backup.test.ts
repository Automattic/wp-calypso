import { findBackup } from '../backups-browser';
import type { ActivityLogEntry } from '@automattic/api-core';

const entry = ( name: string, rewindId: string ) =>
	( { name, rewind_id: rewindId } ) as ActivityLogEntry;

const LOG = [
	entry( 'rewind__backup_complete_full', '1792247440.1' ),
	entry( 'plugin__updated', '1792244500.5' ),
	entry( 'rewind__backup_complete_full', '1792244435.274' ),
	entry( 'rewind__backup_only_complete_full', '1792157000.2' ),
];

describe( 'findBackup', () => {
	it( 'finds the entry with the rewind id', () => {
		expect( findBackup( LOG, '1792244500.5' ) ).toBe( LOG[ 1 ] );
	} );

	it( 'finds the backup that completed after a backup period', () => {
		expect( findBackup( LOG, '1792244301' ) ).toBe( LOG[ 2 ] );
	} );

	it( 'finds nothing for a period no backup completed within a day of', () => {
		expect( findBackup( LOG, '1792000000' ) ).toBeNull();
	} );

	it( 'does not stand in another backup for an unknown restore point', () => {
		expect( findBackup( LOG, '1792244301.5' ) ).toBeNull();
	} );
} );
