/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import hasPendingCommentRequests from 'state/selectors/has-pending-comment-requests';
import { COMMENTS_CHANGE_STATUS } from 'state/action-types';
import { getRequestKey } from 'state/data-layer/wpcom-http/utils';

const actionKey = getRequestKey( {
	type: COMMENTS_CHANGE_STATUS,
	commentId: 1,
	status: 'approved',
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );
const actionKey2 = getRequestKey( {
	type: COMMENTS_CHANGE_STATUS,
	commentId: 2,
	status: 'approved',
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );

describe( 'hasPendingCommentRequests()', () => {
	test( 'should return true if we have pending actions', () => {
		const state = deepFreeze( {
			ui: { comments: { pendingActions: [ actionKey, actionKey2 ] } },
			dataRequests: {
				[ actionKey ]: { status: 'success' },
				[ actionKey2 ]: { status: 'pending' },
			},
		} );
		expect( hasPendingCommentRequests( state ) ).toEqual( true );
	} );
	test( 'should return false if do not have pending actions', () => {
		const state = deepFreeze( {
			ui: { comments: { pendingActions: [ actionKey, actionKey2 ] } },
			dataRequests: {
				[ actionKey ]: { status: 'success' },
				[ actionKey2 ]: { status: 'success' },
			},
		} );
		expect( hasPendingCommentRequests( state ) ).toEqual( false );
	} );
	test( 'only checks against actions we track in ui state', () => {
		const state = deepFreeze( {
			ui: { comments: { pendingActions: [ actionKey ] } },
			dataRequests: {
				[ actionKey ]: { status: 'success' },
				[ actionKey2 ]: { status: 'pending' },
			},
		} );
		expect( hasPendingCommentRequests( state ) ).toEqual( false );
	} );
} );
