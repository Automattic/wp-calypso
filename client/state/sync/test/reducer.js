import {
	SITE_SYNC_STATUS_REQUEST as REQUEST_STATUS,
	SITE_SYNC_STATUS_REQUEST_FAILURE as REQUEST_STATUS_FAILURE,
} from 'calypso/state/action-types';
import { setSiteSyncStatus, setSyncInProgress } from 'calypso/state/sync/actions';
import { serialize, deserialize } from 'calypso/state/utils';
import { SiteSyncStatus } from '../constants';
import persistentReducer, { siteReducer as reducer, fetchingStatus } from '../reducer';

describe( 'state', () => {
	describe( 'automated-transfer', () => {
		describe( 'reducer', () => {
			describe( 'fetchingStatus', () => {
				test( 'should be false when fetching the status is unsuccessful', () => {
					expect( fetchingStatus( true, { type: REQUEST_STATUS_FAILURE } ) ).toBe( false );
				} );

				test( 'should be truthy when fetching transfer status', () => {
					const action = { type: REQUEST_STATUS };

					expect( fetchingStatus( null, action ) ).toBe( true );
				} );
			} );

			test( 'should persist all state keys except fetchingStatus and isSyncingInProgress', () => {
				const SITE_ID = 12345;
				const AT_STATE = {
					[ SITE_ID ]: {
						status: 'completed',
						progress: 1,
						isSyncingInProgress: true,
						syncingTargetSite: 'production',
						syncingSourceSite: 'staging',
						lastRestoreId: '12345',
						fetchingStatus: true,
					},
				};

				const serialized = serialize( persistentReducer, AT_STATE ).root();
				expect( serialized[ SITE_ID ] ).toHaveProperty( 'status' );
				expect( serialized[ SITE_ID ] ).toHaveProperty( 'progress' );
				expect( serialized[ SITE_ID ] ).toHaveProperty( 'syncingTargetSite' );
				expect( serialized[ SITE_ID ] ).toHaveProperty( 'syncingSourceSite' );
				expect( serialized[ SITE_ID ] ).toHaveProperty( 'lastRestoreId' );
				expect( serialized[ SITE_ID ] ).not.toHaveProperty( 'fetchingStatus' );
				expect( serialized[ SITE_ID ] ).not.toHaveProperty( 'isSyncingInProgress' );
				expect( serialized[ SITE_ID ] ).not.toHaveProperty( 'error' );

				const deserialized = deserialize( persistentReducer, AT_STATE );
				expect( deserialized[ SITE_ID ] ).toHaveProperty( 'status' );
				expect( deserialized[ SITE_ID ] ).toHaveProperty( 'progress' );
				expect( serialized[ SITE_ID ] ).toHaveProperty( 'syncingTargetSite' );
				expect( serialized[ SITE_ID ] ).toHaveProperty( 'syncingSourceSite' );
				expect( serialized[ SITE_ID ] ).toHaveProperty( 'lastRestoreId' );
				// The non-persisted property has default value, persisted value is ignored
				expect( deserialized[ SITE_ID ] ).toHaveProperty( 'isSyncingInProgress', false );
				expect( deserialized[ SITE_ID ] ).toHaveProperty( 'fetchingStatus', false );
				expect( deserialized[ SITE_ID ] ).toHaveProperty( 'error', null );
			} );

			test( 'should reset progress and status state if sync in progress become false', () => {
				const SITE_ID = 12345;
				const AT_STATE = {
					status: SiteSyncStatus.COMPLETED,
					progress: 1,
					isSyncingInProgress: true,
					syncingTargetSite: 'production',
					syncingSourceSite: 'staging',
					lastRestoreId: '12345',
					fetchingStatus: false,
					error: null,
				};
				const newState = reducer( AT_STATE, setSyncInProgress( SITE_ID, false ) );
				expect( newState ).toHaveProperty( 'isSyncingInProgress', false );
				expect( newState ).toHaveProperty( 'status', null );
			} );

			test( 'should set isSyncingInProgress to false if status become completed', () => {
				const SITE_ID = 12345;
				const AT_STATE = {
					status: SiteSyncStatus.PENDING,
					progress: 1,
					isSyncingInProgress: true,
					syncingTargetSite: 'production',
					syncingSourceSite: 'staging',
					lastRestoreId: '12345',
					fetchingStatus: false,
					error: null,
				};
				reducer( AT_STATE, {} );
				const newState = reducer(
					AT_STATE,
					setSiteSyncStatus( SITE_ID, SiteSyncStatus.COMPLETED )
				);
				expect( newState ).toHaveProperty( 'isSyncingInProgress', false );
				expect( newState ).toHaveProperty( 'status', SiteSyncStatus.COMPLETED );
				expect( newState ).toHaveProperty( 'progress', 1 );
				expect( newState ).toHaveProperty( 'fetchingStatus', false );
			} );
		} );
	} );
} );
