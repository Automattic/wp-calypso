/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	WP_SUPER_CACHE_DELETE_DEBUG_LOG,
	WP_SUPER_CACHE_DELETE_DEBUG_LOG_FAILURE,
	WP_SUPER_CACHE_DELETE_DEBUG_LOG_SUCCESS,
	WP_SUPER_CACHE_REQUEST_DEBUG_LOGS,
	WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_FAILURE,
	WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_SUCCESS,
} from '../../action-types';
import {
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import reducer, {
	deleteStatus,
	items,
	requesting,
} from '../reducer';

describe( 'reducer', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;
	const filename = '89fe3b92191d36ee7fb3956cd52c704c.php';

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'deleteStatus',
			'items',
			'requesting',
		] );
	} );

	describe( 'deleteStatus()', () => {
		const previousState = deepFreeze( {
			[ primarySiteId ]: {
				[ filename ]: true
			}
		} );

		it( 'should default to an empty object', () => {
			const state = deleteStatus( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should set request to true if request in progress', () => {
			const state = deleteStatus( undefined, {
				type: WP_SUPER_CACHE_DELETE_DEBUG_LOG,
				siteId: primarySiteId,
				filename,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: {
					[ filename ]: true
				}
			} );
		} );

		it( 'should accumulate requesting values', () => {
			const state = deleteStatus( previousState, {
				type: WP_SUPER_CACHE_DELETE_DEBUG_LOG,
				siteId: secondarySiteId,
				filename
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: {
					[ filename ]: true
				},
				[ secondarySiteId ]: {
					[ filename ]: true
				}
			} );
		} );

		it( 'should set request to false if request finishes successfully', () => {
			const state = deleteStatus( previousState, {
				type: WP_SUPER_CACHE_DELETE_DEBUG_LOG_SUCCESS,
				siteId: primarySiteId,
				filename,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: {
					[ filename ]: false
				}
			} );
		} );

		it( 'should set request to false if request finishes with failure', () => {
			const state = deleteStatus( previousState, {
				type: WP_SUPER_CACHE_DELETE_DEBUG_LOG_FAILURE,
				siteId: primarySiteId,
				filename,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: {
					[ filename ]: false
				}
			} );
		} );

		it( 'should not persist state', () => {
			const state = deleteStatus( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = deleteStatus( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'items()', () => {
		const primaryDebugLogs = {
			'89fe3b92191d36ee7fb3956cd52c704c.php': '145cc79483f018538a3edc78117622ba'
		};
		const secondaryDebugLogs = {
			'5634c09a3100cd6f9d1eb0aa22c641f8.php': '57f42f740d3cdaca5a9ccc771cb4e026'
		};

		const previousState = deepFreeze( {
			[ primarySiteId ]: primaryDebugLogs,
		} );

		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index debug logs by site ID', () => {
			const state = items( undefined, {
				type: WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_SUCCESS,
				siteId: primarySiteId,
				data: primaryDebugLogs,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: primaryDebugLogs,
			} );
		} );

		it( 'should accumulate debug logs', () => {
			const state = items( previousState, {
				type: WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_SUCCESS,
				siteId: secondarySiteId,
				data: secondaryDebugLogs,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: primaryDebugLogs,
				[ secondarySiteId ]: secondaryDebugLogs,
			} );
		} );

		it( 'should override previous debug logs of same site ID', () => {
			const state = items( previousState, {
				type: WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_SUCCESS,
				siteId: primarySiteId,
				data: secondaryDebugLogs,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: secondaryDebugLogs,
			} );
		} );

		it( 'should accumulate new debug logs and overwrite existing ones for the same site ID', () => {
			const newResults = {
				'ce5867bb0bbe558005c1c1999b471727.php': '5ea08f197441694d4b3d5ab872f53875',
				'79be02e19bebb31c4384e5971b397fce.php': 'b165dda29fcb0c09abf7c8c4e04f53e6',
			};

			const state = items( previousState, {
				type: WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_SUCCESS,
				siteId: primarySiteId,
				data: newResults,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: newResults,
			} );
		} );

		it( 'should not persist state', () => {
			const state = items( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = items( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'requesting()', () => {
		const previousState = deepFreeze( {
			[ primarySiteId ]: true,
		} );

		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should set request to true if request in progress', () => {
			const state = requesting( undefined, {
				type: WP_SUPER_CACHE_REQUEST_DEBUG_LOGS,
				siteId: primarySiteId,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: true,
			} );
		} );

		it( 'should accumulate requesting values', () => {
			const state = requesting( previousState, {
				type: WP_SUPER_CACHE_REQUEST_DEBUG_LOGS,
				siteId: secondarySiteId,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		it( 'should set request to false if request finishes successfully', () => {
			const state = requesting( previousState, {
				type: WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_SUCCESS,
				siteId: primarySiteId,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		it( 'should set request to false if request finishes with failure', () => {
			const state = requesting( previousState, {
				type: WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_FAILURE,
				siteId: primarySiteId,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		it( 'should not persist state', () => {
			const state = requesting( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = requesting( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );
	} );
} );
