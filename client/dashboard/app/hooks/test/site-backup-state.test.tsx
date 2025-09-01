/**
 * @jest-environment jsdom
 */
import {
	type BackupEntry,
	BackupEntryStatuses,
	BackupEntryErrorStatuses,
} from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import wpcom from 'calypso/lib/wp';
import { useBackupState } from '../site-backup-state';

// Mock lib/wp to return data directly from our test setup
jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

const wpMock = wpcom;

// Test data factory
const createBackupEntry = ( overrides: Partial< BackupEntry > = {} ): BackupEntry => ( {
	id: '1234567890',
	started: '2025-08-26 00:44:15',
	last_updated: '2025-08-26 00:44:15',
	status: BackupEntryStatuses.STARTED,
	period: '1756169052',
	percent: '45',
	is_backup: '1',
	is_scan: '1',
	...overrides,
} );

// Create a test wrapper that exposes queryClient for testing
let testQueryClient: QueryClient;

function TestWrapper( { children }: { children: React.ReactNode } ) {
	const [ queryClient ] = React.useState(
		() =>
			new QueryClient( {
				defaultOptions: {
					queries: { retry: false },
				},
			} )
	);

	// Expose queryClient for test access
	testQueryClient = queryClient;

	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
}

// Mock backups API endpoint by setting up the mock response
function mockBackupsAPI( siteId: number, backups: BackupEntry[] ) {
	wpMock.req.get.mockImplementation( ( path: string ) => {
		if ( path === `/sites/${ siteId }/rewind/backups` ) {
			return Promise.resolve( backups );
		}
		return Promise.reject( new Error( `Unexpected path: ${ path }` ) );
	} );
}

// Clean up after each test
afterEach( () => {
	wpMock.req.get.mockReset();
} );

describe( 'useBackupState', () => {
	const mockSiteId = 123;

	beforeEach( () => {
		// Default to empty backups list
		mockBackupsAPI( mockSiteId, [] );
	} );

	describe( 'idle state', () => {
		it( 'should return idle state when no backups exist', async () => {
			const { result } = renderHook( () => useBackupState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'idle' );
				expect( result.current.backup ).toBeNull();
				expect( result.current.hasRecentlyCompleted ).toBe( false );
			} );
		} );

		it( 'should return idle state when latest backup is finished (not tracked)', async () => {
			const finishedBackup = createBackupEntry( {
				status: BackupEntryStatuses.FINISHED,
				percent: '100',
			} );
			mockBackupsAPI( mockSiteId, [ finishedBackup ] );

			const { result } = renderHook( () => useBackupState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'idle' );
				expect( result.current.backup ).toBeNull();
				expect( result.current.hasRecentlyCompleted ).toBe( false );
			} );
		} );

		it( 'should return idle state when latest backup failed (not tracked)', async () => {
			const failedBackup = createBackupEntry( {
				status: BackupEntryStatuses.ERROR,
				percent: '95',
			} );
			mockBackupsAPI( mockSiteId, [ failedBackup ] );

			const { result } = renderHook( () => useBackupState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'idle' );
				expect( result.current.backup ).toBeNull();
				expect( result.current.hasRecentlyCompleted ).toBe( false );
			} );
		} );
	} );

	describe( 'running state', () => {
		it( 'should detect and track a backup in progress (running)', async () => {
			const runningBackup = createBackupEntry( {
				status: BackupEntryStatuses.STARTED,
				percent: '45',
				period: '1756169052',
			} );
			mockBackupsAPI( mockSiteId, [ runningBackup ] );

			const { result } = renderHook( () => useBackupState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'running' );
				expect( result.current.backup?.period ).toBe( '1756169052' );
				expect( result.current.hasRecentlyCompleted ).toBe( false );
			} );
		} );

		it( 'should handle backup without percent value', async () => {
			const backupWithoutPercent = createBackupEntry( {
				status: BackupEntryStatuses.STARTED,
				percent: '',
			} );
			mockBackupsAPI( mockSiteId, [ backupWithoutPercent ] );

			const { result } = renderHook( () => useBackupState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'running' );
			} );
		} );
	} );

	describe( 'success state', () => {
		it( 'should transition from progress to success and set hasRecentlyCompleted', async () => {
			// Start with backup in progress
			const progressBackup = createBackupEntry( {
				status: BackupEntryStatuses.STARTED,
				period: '1756169052',
				percent: '75',
			} );
			mockBackupsAPI( mockSiteId, [ progressBackup ] );

			const { result } = renderHook( () => useBackupState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			// Wait for progress state - backup is being tracked
			await waitFor( () => {
				expect( result.current.status ).toBe( 'running' );
				expect( result.current.backup?.period ).toBe( '1756169052' );
				expect( result.current.hasRecentlyCompleted ).toBe( false );
			} );

			// Simulate backup completing - update the mock to return completed backup
			const completedBackup = createBackupEntry( {
				status: BackupEntryStatuses.FINISHED,
				period: '1756169052',
				percent: '100',
			} );
			mockBackupsAPI( mockSiteId, [ completedBackup ] );

			// Manually refetch the query to simulate the polling behavior
			await testQueryClient.refetchQueries( {
				queryKey: [ 'site', mockSiteId, 'backups' ],
			} );

			// Check that the backup transitioned to success state
			await waitFor( () => {
				expect( result.current.status ).toBe( 'success' );
				expect( result.current.backup?.period ).toBe( '1756169052' );
				expect( result.current.hasRecentlyCompleted ).toBe( true );
			} );
		} );

		it( 'should identify completed backups', async () => {
			const completedBackup = createBackupEntry( {
				status: BackupEntryStatuses.FINISHED,
				period: '1756169052',
				percent: '100',
			} );
			mockBackupsAPI( mockSiteId, [ completedBackup ] );

			const { result } = renderHook( () => useBackupState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			// Should detect completed backup but not track it (since we didn't track it from progress)
			await waitFor( () => {
				expect( result.current.status ).toBe( 'idle' );
			} );
		} );
	} );

	describe( 'error state', () => {
		it( 'should identify failed backups that are not being tracked', async () => {
			const failedBackup = createBackupEntry( {
				status: BackupEntryErrorStatuses.ERROR,
				period: '1756169052',
			} );
			mockBackupsAPI( mockSiteId, [ failedBackup ] );

			const { result } = renderHook( () => useBackupState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			// Should detect failed backup but not track it (since we didn't track it from progress)
			await waitFor( () => {
				expect( result.current.status ).toBe( 'idle' );
			} );
		} );

		it( 'should transition from progress to error when tracked backup fails', async () => {
			// Start with backup in progress
			const progressBackup = createBackupEntry( {
				status: BackupEntryStatuses.STARTED,
				period: '1756169052',
				percent: '30',
			} );
			mockBackupsAPI( mockSiteId, [ progressBackup ] );

			const { result } = renderHook( () => useBackupState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			// Wait for progress state - backup is being tracked
			await waitFor( () => {
				expect( result.current.status ).toBe( 'running' );
				expect( result.current.backup?.period ).toBe( '1756169052' );
				expect( result.current.hasRecentlyCompleted ).toBe( false );
			} );

			// Simulate backup failing - update the mock to return failed backup
			const failedBackup = createBackupEntry( {
				status: BackupEntryErrorStatuses.ERROR,
				period: '1756169052',
			} );
			mockBackupsAPI( mockSiteId, [ failedBackup ] );

			// Manually refetch the query to simulate the polling behavior
			await testQueryClient.refetchQueries( {
				queryKey: [ 'site', mockSiteId, 'backups' ],
			} );

			// Check that the backup transitioned to error state
			await waitFor( () => {
				expect( result.current.status ).toBe( 'error' );
				expect( result.current.backup?.period ).toBe( '1756169052' );
				expect( result.current.hasRecentlyCompleted ).toBe( false );
			} );
		} );
	} );
} );
