import { NOTICE_CREATE } from 'calypso/state/action-types';
import {
	getRewindRestoreProgress,
	rewindGranularRestore,
	rewindRestore,
	updateRewindRestoreProgress,
} from 'calypso/state/activity-log/actions';
import { requestRewindState } from 'calypso/state/rewind/state/actions';
import {
	receiveRestoreError,
	receiveRestoreSuccess,
	requestGranularRestore,
	requestRestore,
} from '../';

const siteId = 77203074;
const timestamp = 1496768464;
const restoreId = 12345;
const types = { themes: true, sqls: true };

describe( 'receiveRestoreSuccess', () => {
	test( 'should dispatch get restore progress on success', () => {
		expect( receiveRestoreSuccess( { siteId, timestamp }, restoreId ) ).toEqual( [
			getRewindRestoreProgress( siteId, restoreId ),
			requestRewindState( siteId ),
		] );
	} );
} );

describe( 'requestRestore', () => {
	test( 'requestRestore sends acknowledge_threats when acknowledged', () => {
		const { body } = requestRestore( rewindRestore( siteId, timestamp, types, true ) );

		expect( body ).toEqual( expect.objectContaining( { types, acknowledge_threats: true } ) );
	} );

	test( 'requestRestore sends acknowledge_threats false otherwise', () => {
		const unacknowledged = requestRestore( rewindRestore( siteId, timestamp, types, false ) );
		const legacyCall = requestRestore( rewindRestore( siteId, timestamp, types ) );

		expect( unacknowledged.body.acknowledge_threats ).toBe( false );
		expect( legacyCall.body.acknowledge_threats ).toBe( false );
		expect( legacyCall.body ).toEqual( expect.objectContaining( { types, force_rewind: true } ) );
	} );
} );

describe( 'requestGranularRestore', () => {
	test( 'sends acknowledge_threats when acknowledged', () => {
		const { body } = requestGranularRestore(
			rewindGranularRestore( siteId, timestamp, 'f1,f2', '', true )
		);

		expect( body ).toEqual(
			expect.objectContaining( {
				types: 'paths',
				include_path_list: 'f1,f2',
				acknowledge_threats: true,
			} )
		);
	} );

	test( 'sends acknowledge_threats false otherwise', () => {
		const unacknowledged = requestGranularRestore(
			rewindGranularRestore( siteId, timestamp, 'f1', '', false )
		);
		const legacyCall = requestGranularRestore( rewindGranularRestore( siteId, timestamp, 'f1' ) );

		expect( unacknowledged.body.acknowledge_threats ).toBe( false );
		expect( legacyCall.body.acknowledge_threats ).toBe( false );
		expect( legacyCall.body ).toEqual(
			expect.objectContaining( { types: 'paths', include_path_list: 'f1', force_rewind: true } )
		);
	} );
} );

describe( 'receiveRestoreError', () => {
	const analyticsEventNames = ( action ) =>
		action.meta.analytics.map( ( { payload } ) => payload.name );

	test( 'receiveRestoreError shows the known-threats notice for threats_not_acknowledged', () => {
		const [ action, progress ] = receiveRestoreError(
			{ siteId, timestamp },
			{ error: 'threats_not_acknowledged', statusCode: 409 }
		);

		expect( progress ).toEqual(
			updateRewindRestoreProgress( siteId, timestamp, null, {
				status: 'failed',
				errorCode: 'threats_not_acknowledged',
			} )
		);
		expect( action.type ).toBe( NOTICE_CREATE );
		expect( action.notice ).toEqual(
			expect.objectContaining( {
				status: 'is-error',
				text: 'This backup is known to contain security threats. Acknowledge them to restore it.',
			} )
		);
		expect( analyticsEventNames( action ) ).toEqual( [
			'calypso_rewind_to_threats_not_acknowledged',
		] );
	} );

	test( 'passes on the known threats the refusal carries', () => {
		const knownThreats = {
			malware: 3,
			database: 0,
			vulnerable: 0,
			ignored: 0,
			flagged: 3,
			fixed: 0,
		};
		const [ , progress ] = receiveRestoreError(
			{ siteId, timestamp },
			{
				error: 'threats_not_acknowledged',
				statusCode: 409,
				data: { known_threats: knownThreats, backup_period: 200 },
			}
		);

		expect( progress ).toEqual(
			updateRewindRestoreProgress( siteId, timestamp, null, {
				status: 'failed',
				errorCode: 'threats_not_acknowledged',
				knownThreats,
			} )
		);
	} );

	test( 'keeps the generic notice for other errors', () => {
		const action = receiveRestoreError(
			{ siteId, timestamp },
			{ error: 'server_error', statusCode: 500 }
		);

		expect( action.notice.text ).toBe(
			'Oops, something went wrong. Please try again soon or contact support for help.'
		);
		expect( analyticsEventNames( action ) ).toEqual( [ 'calypso_rewind_to_unknown_error' ] );
	} );
} );
