/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
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
	const EMAIL_ADDRESS = 'draft@feedback.test';

	it( 'should add a feedback request', () => {
		const state = reducer( undefined, {
			type: DRAFT_FEEDBACK_SHARE_ADD,
			siteId: SITE_ID,
			postId: POST_ID,
			emailAddress: EMAIL_ADDRESS,
		} );

		expect( state ).to.eql( {
			[ SITE_ID ]: {
				[ POST_ID ]: {
					[ EMAIL_ADDRESS ]: {
						enabled: true,
						comments: [],
					}
				},
			},
		} );
	} );
	it( 'should remove a feedback request', () => {
		const state = reducer( {
			[ SITE_ID ]: {
				[ POST_ID ]: {
					[ EMAIL_ADDRESS ]: {
						enabled: true,
						comments: [],
					}
				},
			},
		}, {
			type: DRAFT_FEEDBACK_SHARE_REMOVE,
			siteId: SITE_ID,
			postId: POST_ID,
			emailAddress: EMAIL_ADDRESS,
		} );

		expect( state ).to.eql( {} );
	} );
	it( 'should revoke a feedback request', () => {
		const state = reducer( {
			[ SITE_ID ]: {
				[ POST_ID ]: {
					[ EMAIL_ADDRESS ]: {
						enabled: true,
						comments: [],
					}
				},
			},
		}, {
			type: DRAFT_FEEDBACK_SHARE_REVOKE,
			siteId: SITE_ID,
			postId: POST_ID,
			emailAddress: EMAIL_ADDRESS,
		} );

		expect( state ).to.eql( {
			[ SITE_ID ]: {
				[ POST_ID ]: {
					[ EMAIL_ADDRESS ]: {
						enabled: false,
						comments: [],
					}
				},
			},
		} );
	} );
	it( 'should preserve comments when revoking a feedback request', () => {
		const state = reducer( {
			[ SITE_ID ]: {
				[ POST_ID ]: {
					[ EMAIL_ADDRESS ]: {
						enabled: true,
						comments: [ 'comment1', 'comment2', 'comment3' ],
					}
				},
			},
		}, {
			type: DRAFT_FEEDBACK_SHARE_REVOKE,
			siteId: SITE_ID,
			postId: POST_ID,
			emailAddress: EMAIL_ADDRESS,
		} );

		expect( state ).to.eql( {
			[ SITE_ID ]: {
				[ POST_ID ]: {
					[ EMAIL_ADDRESS ]: {
						enabled: false,
						comments: [ 'comment1', 'comment2', 'comment3' ],
					}
				},
			},
		} );
	} );
	it( 'should restore a feedback request', () => {
		const state = reducer( {
			[ SITE_ID ]: {
				[ POST_ID ]: {
					[ EMAIL_ADDRESS ]: {
						enabled: false,
						comments: [],
					}
				},
			},
		}, {
			type: DRAFT_FEEDBACK_SHARE_RESTORE,
			siteId: SITE_ID,
			postId: POST_ID,
			emailAddress: EMAIL_ADDRESS,
		} );

		expect( state ).to.eql( {
			[ SITE_ID ]: {
				[ POST_ID ]: {
					[ EMAIL_ADDRESS ]: {
						enabled: true,
						comments: [],
					}
				},
			},
		} );
	} );
	it( 'should preserve comments when restoring a feedback request', () => {
		const state = reducer( {
			[ SITE_ID ]: {
				[ POST_ID ]: {
					[ EMAIL_ADDRESS ]: {
						enabled: false,
						comments: [ 'comment1', 'comment2', 'comment3' ],
					}
				},
			},
		}, {
			type: DRAFT_FEEDBACK_SHARE_RESTORE,
			siteId: SITE_ID,
			postId: POST_ID,
			emailAddress: EMAIL_ADDRESS,
		} );

		expect( state ).to.eql( {
			[ SITE_ID ]: {
				[ POST_ID ]: {
					[ EMAIL_ADDRESS ]: {
						enabled: true,
						comments: [ 'comment1', 'comment2', 'comment3' ],
					}
				},
			},
		} );
	} );
	it( 'should add a feedback comment', () => {
		const stateA = reducer( {
			[ SITE_ID ]: {
				[ POST_ID ]: {
					[ EMAIL_ADDRESS ]: {
						enabled: true,
						comments: [],
					}
				},
			},
		}, {
			type: DRAFT_FEEDBACK_COMMENT_ADD,
			siteId: SITE_ID,
			postId: POST_ID,
			emailAddress: EMAIL_ADDRESS,
			comment: 'comment1'
		} );

		expect( stateA ).to.eql( {
			[ SITE_ID ]: {
				[ POST_ID ]: {
					[ EMAIL_ADDRESS ]: {
						enabled: true,
						comments: [ 'comment1' ],
					}
				},
			},
		} );

		const stateB = reducer( stateA, {
			type: DRAFT_FEEDBACK_COMMENT_ADD,
			siteId: SITE_ID,
			postId: POST_ID,
			emailAddress: EMAIL_ADDRESS,
			comment: 'comment2'
		} );

		expect( stateB ).to.eql( {
			[ SITE_ID ]: {
				[ POST_ID ]: {
					[ EMAIL_ADDRESS ]: {
						enabled: true,
						comments: [ 'comment1', 'comment2' ],
					}
				},
			},
		} );
	} );
} );
