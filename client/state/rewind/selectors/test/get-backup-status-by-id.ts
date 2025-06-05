import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';
import getBackupStatusById from '../get-backup-status-by-id';

jest.mock( 'calypso/state/selectors/get-rewind-backups' );

describe( 'getBackupStatusById', () => {
	const TEST_SITE_ID = 123;
	const TEST_BACKUP_ID = 456;
	const mockState = {};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'should return null when no backups are found', () => {
		( getRewindBackups as jest.Mock ).mockReturnValue( null );

		const result = getBackupStatusById( mockState, TEST_SITE_ID, TEST_BACKUP_ID );

		expect( getRewindBackups ).toHaveBeenCalledWith( mockState, TEST_SITE_ID );
		expect( result ).toEqual( null );
	} );

	test( 'should return null when the backups array is empty', () => {
		( getRewindBackups as jest.Mock ).mockReturnValue( [] );

		const result = getBackupStatusById( mockState, TEST_SITE_ID, TEST_BACKUP_ID );

		expect( getRewindBackups ).toHaveBeenCalledWith( mockState, TEST_SITE_ID );
		expect( result ).toEqual( null );
	} );

	test( 'should return null when the requested backup ID does not exist', () => {
		const mockBackups = [
			{ id: 123, status: 'finished' },
			{ id: 789, status: 'failed' },
		];
		( getRewindBackups as jest.Mock ).mockReturnValue( mockBackups );

		const result = getBackupStatusById( mockState, TEST_SITE_ID, TEST_BACKUP_ID );

		expect( getRewindBackups ).toHaveBeenCalledWith( mockState, TEST_SITE_ID );
		expect( result ).toEqual( null );
	} );

	test( 'should correctly identify a backup in progress with status "started"', () => {
		const mockBackup = { id: TEST_BACKUP_ID, status: 'started' };
		( getRewindBackups as jest.Mock ).mockReturnValue( [ mockBackup ] );

		const result = getBackupStatusById( mockState, TEST_SITE_ID, TEST_BACKUP_ID );

		expect( getRewindBackups ).toHaveBeenCalledWith( mockState, TEST_SITE_ID );
		expect( result ).toEqual( {
			isInProgress: true,
			isFinished: false,
			hasFailed: false,
			status: 'started',
			backup: mockBackup,
		} );
	} );

	test( 'should correctly identify a successfully completed backup with status "finished"', () => {
		const mockBackup = { id: TEST_BACKUP_ID, status: 'finished' };
		( getRewindBackups as jest.Mock ).mockReturnValue( [ mockBackup ] );

		const result = getBackupStatusById( mockState, TEST_SITE_ID, TEST_BACKUP_ID );

		expect( getRewindBackups ).toHaveBeenCalledWith( mockState, TEST_SITE_ID );
		expect( result ).toEqual( {
			isInProgress: false,
			isFinished: true,
			hasFailed: false,
			status: 'finished',
			backup: mockBackup,
		} );
	} );

	test( 'should correctly identify a failed backup with status "error"', () => {
		const mockBackup = { id: TEST_BACKUP_ID, status: 'error' };
		( getRewindBackups as jest.Mock ).mockReturnValue( [ mockBackup ] );

		const result = getBackupStatusById( mockState, TEST_SITE_ID, TEST_BACKUP_ID );

		expect( getRewindBackups ).toHaveBeenCalledWith( mockState, TEST_SITE_ID );
		expect( result ).toEqual( {
			isInProgress: false,
			isFinished: false,
			hasFailed: true,
			status: 'error',
			backup: mockBackup,
		} );
	} );

	test( 'should correctly identify a failed backup with status "not-accessible"', () => {
		const mockBackup = { id: TEST_BACKUP_ID, status: 'not-accessible' };
		( getRewindBackups as jest.Mock ).mockReturnValue( [ mockBackup ] );

		const result = getBackupStatusById( mockState, TEST_SITE_ID, TEST_BACKUP_ID );

		expect( getRewindBackups ).toHaveBeenCalledWith( mockState, TEST_SITE_ID );
		expect( result ).toEqual( {
			isInProgress: false,
			isFinished: false,
			hasFailed: true,
			status: 'not-accessible',
			backup: mockBackup,
		} );
	} );

	test( 'should find the correct backup when multiple backups exist', () => {
		const mockBackups = [
			{ id: 123, status: 'finished' },
			{ id: TEST_BACKUP_ID, status: 'started' },
			{ id: 789, status: 'failed' },
		];
		( getRewindBackups as jest.Mock ).mockReturnValue( mockBackups );

		const result = getBackupStatusById( mockState, TEST_SITE_ID, TEST_BACKUP_ID );

		expect( getRewindBackups ).toHaveBeenCalledWith( mockState, TEST_SITE_ID );
		expect( result ).toEqual( {
			isInProgress: true,
			isFinished: false,
			hasFailed: false,
			status: 'started',
			backup: mockBackups[ 1 ],
		} );
	} );
} );
