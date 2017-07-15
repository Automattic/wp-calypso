/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	EDITOR_START,
	EDITOR_STOP,
	DRAFT_FEEDBACK_SHARE_ADD,
	DRAFT_FEEDBACK_SHARE_REMOVE,
	DRAFT_FEEDBACK_SHARE_REVOKE,
	DRAFT_FEEDBACK_SHARE_RESTORE,
	DRAFT_FEEDBACK_COMMENT_ADD,
} from 'state/action-types';
import reducer from '../reducer';

describe( 'reducer', () => {
	const SITE_ID = 123;
	const POST_ID = 456;

	it( 'should initialize draft feedback when editor started', () => {
		const state = reducer( undefined, {
			type: EDITOR_START,
			siteId: SITE_ID,
			postId: POST_ID,
		} );

		expect( state ).to.eql( {
			[ SITE_ID ]: {
				[ POST_ID ]: {},
			},
		} );
	} );
	it( 'should forget draft feedback when editor stopped' );
	it( 'should add a feedback request' );
	it( 'should remove a feedback request' );
	it( 'should revoke a feedback request' );
	it( 'should restore a feedback request' );
	it( 'should add a feedback comment' );
} );
