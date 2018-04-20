/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import assert from 'assert'; // eslint-disable-line import/no-nodejs-modules
import { assign, isEqual } from 'lodash';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';

jest.mock( 'lib/user', () => () => {} );

describe( 'post-edit-store', () => {
	let PostEditStore, dispatcherCallback;

	beforeAll( () => {
		spy( Dispatcher, 'register' );
		PostEditStore = require( '../post-edit-store' );
		dispatcherCallback = Dispatcher.register.lastCall.args[ 0 ];
	} );

	afterAll( () => {
		Dispatcher.register.restore();
	} );

	function dispatchReceivePost() {
		dispatcherCallback( {
			action: {
				type: 'RECEIVE_POST_TO_EDIT',
				post: {
					ID: 777,
					site_ID: 123,
					title: 'OMG Unicorns',
					categories: {
						Unicorns: {
							ID: 199,
							name: 'Unicorns',
						},
					},
				},
			},
		} );
	}

	test( 'initializes new draft post properly', () => {
		const siteId = 1234;

		dispatcherCallback( {
			action: {
				type: 'DRAFT_NEW_POST',
				site: {
					ID: siteId,
				},
			},
		} );

		assert( PostEditStore.getSavedPost().ID === undefined );
		assert( PostEditStore.getSavedPost().site_ID === siteId );
		const post = PostEditStore.get();
		assert( post.status === 'draft' );
		assert( PostEditStore.isNew() );
	} );

	test( 'initialize existing post', () => {
		const siteId = 12,
			postId = 345;

		dispatcherCallback( {
			action: {
				type: 'START_EDITING_POST',
				siteId: siteId,
				postId: postId,
			},
		} );

		assert( ! PostEditStore.isNew() );
	} );

	test( 'sets parent_id properly', () => {
		dispatchReceivePost();
		const post = PostEditStore.get();
		assert( post.parent_id === null );
	} );

	test( 'decodes entities on received post title', () => {
		dispatcherCallback( {
			action: {
				type: 'DRAFT_NEW_POST',
				title: 'Ribs &amp; Chicken',
			},
		} );

		assert( PostEditStore.get().title === 'Ribs & Chicken' );
	} );

	test( 'updates parent_id after a set', () => {
		dispatchReceivePost();
		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: {
					parent: 101,
				},
			},
		} );

		const post = PostEditStore.get();
		assert( post.parent_id, 101 );
	} );

	test( 'does not decode post title entities on EDIT_POST', () => {
		dispatcherCallback( {
			action: {
				type: 'DRAFT_NEW_POST',
			},
		} );

		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: {
					title: 'Ribs &gt; Chicken',
				},
			},
		} );

		assert( PostEditStore.get().title === 'Ribs &gt; Chicken' );
	} );

	test( 'decodes post title entities on RECEIVE_POST_BEING_EDITED', () => {
		dispatcherCallback( {
			action: {
				type: 'DRAFT_NEW_POST',
			},
		} );

		dispatcherCallback( {
			action: {
				type: 'RECEIVE_POST_BEING_EDITED',
				post: {
					title: 'Ribs &gt; Chicken',
				},
			},
		} );

		assert( PostEditStore.get().title === 'Ribs > Chicken' );
	} );

	test( 'reset on stop editing', () => {
		dispatcherCallback( {
			action: {
				type: 'DRAFT_NEW_POST',
				site: {
					ID: 1234,
				},
			},
		} );

		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: {
					title: 'hello, world!',
					content: 'initial edit',
				},
			},
		} );

		dispatcherCallback( {
			action: {
				type: 'STOP_EDITING_POST',
			},
		} );

		assert( PostEditStore.get() === null );
		assert( PostEditStore.getSavedPost() === null );
	} );

	test( 'updates attributes on edit', () => {
		const siteId = 1234,
			postEdits = {
				title: 'hello, world!',
				content: 'initial edit',
				metadata: [ { key: 'super', value: 'duper', operation: 'update' } ],
			};

		dispatcherCallback( {
			action: {
				type: 'DRAFT_NEW_POST',
				site: {
					ID: siteId,
				},
			},
		} );

		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: postEdits,
			},
		} );

		assert( PostEditStore.isNew() );
		assert( PostEditStore.getSavedPost().title === '' );
		assert( PostEditStore.get().title === postEdits.title );
		assert( PostEditStore.get().content === postEdits.content );
		assert( isEqual( PostEditStore.get().metadata, postEdits.metadata ) );
		assert( PostEditStore.getChangedAttributes().title === postEdits.title );
		assert( PostEditStore.getChangedAttributes().content === postEdits.content );
		assert( isEqual( PostEditStore.getChangedAttributes().metadata, postEdits.metadata ) );
	} );

	test( 'preserves attributes when update is in-flight', () => {
		const siteId = 1234,
			initialPost = {
				ID: 2345,
				title: 'hello, world!',
				content: 'initial edit',
			},
			updates = {
				content: 'updated content',
			};

		dispatcherCallback( {
			action: {
				type: 'DRAFT_NEW_POST',
				site: {
					ID: siteId,
				},
			},
		} );
		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: initialPost,
			},
		} );
		dispatcherCallback( {
			action: {
				type: 'EDIT_POST_SAVE',
			},
		} );

		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: updates,
			},
		} );
		dispatcherCallback( {
			action: {
				type: 'RECEIVE_POST_BEING_EDITED',
				post: initialPost,
			},
		} );

		assert( PostEditStore.get().content === updates.content );
		assert( PostEditStore.isDirty() );
	} );

	test( 'updates existing metadata on edit', () => {
		// initial post
		dispatcherCallback( {
			action: {
				type: 'RECEIVE_POST_TO_EDIT',
				post: {
					metadata: [
						{ key: 'keepable', value: 'constvalue' },
						{ key: 'updatable', value: 'oldvalue' },
						{ key: 'deletable', value: 'trashvalue' },
					],
				},
			},
		} );

		// apply some edits
		const postEdits = {
			title: 'Super Duper',
			metadata: [
				{ key: 'updatable', value: 'newvalue', operation: 'update' },
				{ key: 'deletable', operation: 'delete' },
			],
		};

		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: postEdits,
			},
		} );

		// check the expected values of post attributes after the edit is applied
		assert( PostEditStore.get().title === postEdits.title );
		assert(
			isEqual( PostEditStore.get().metadata, [
				{ key: 'keepable', value: 'constvalue' },
				{ key: 'updatable', value: 'newvalue', operation: 'update' },
				{ key: 'deletable', operation: 'delete' },
			] )
		);

		// check the modifications sent to the API endpoint
		assert( PostEditStore.getChangedAttributes().title === postEdits.title );
		assert(
			isEqual( PostEditStore.getChangedAttributes().metadata, [
				{ key: 'updatable', value: 'newvalue', operation: 'update' },
				{ key: 'deletable', operation: 'delete' },
			] )
		);
	} );

	test( 'should include metadata edits made previously', () => {
		// initial post
		dispatcherCallback( {
			action: {
				type: 'RECEIVE_POST_TO_EDIT',
				post: {
					metadata: [ { key: 'deletable', value: 'trashvalue' } ],
				},
			},
		} );

		// first edit
		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: {
					metadata: [ { key: 'deletable', operation: 'delete' } ],
				},
			},
		} );

		// second edit
		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: {
					metadata: [ { key: 'updatable', value: 'newvalue', operation: 'update' } ],
				},
			},
		} );

		assert(
			isEqual( PostEditStore.get().metadata, [
				{ key: 'deletable', operation: 'delete' },
				{ key: 'updatable', value: 'newvalue', operation: 'update' },
			] )
		);
	} );

	test( 'should not duplicate existing metadata edits', () => {
		// initial post
		dispatcherCallback( {
			action: {
				type: 'RECEIVE_POST_TO_EDIT',
				post: {
					metadata: [
						{ key: 'keepable', value: 'constvalue' },
						{ key: 'phoenixable', value: 'fawkes' },
					],
				},
			},
		} );

		// delete metadata prop
		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: {
					metadata: [ { key: 'phoenixable', operation: 'delete' } ],
				},
			},
		} );

		// recreate the prop
		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: {
					metadata: [ { key: 'phoenixable', value: 'newfawkes', operation: 'update' } ],
				},
			},
		} );

		// edited post metadata after edits
		assert(
			isEqual( PostEditStore.get().metadata, [
				{ key: 'keepable', value: 'constvalue' },
				{ key: 'phoenixable', value: 'newfawkes', operation: 'update' },
			] )
		);

		// metadata update request sent to the API endpoint
		assert(
			isEqual( PostEditStore.getChangedAttributes().metadata, [
				{ key: 'phoenixable', value: 'newfawkes', operation: 'update' },
			] )
		);
	} );

	test( 'reset post after saving an edit', () => {
		const siteId = 1234,
			postEdits = {
				title: 'hello, world!',
				content: 'initial edit',
			};

		dispatcherCallback( {
			action: {
				type: 'DRAFT_NEW_POST',
				site: {
					ID: siteId,
				},
			},
		} );

		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: postEdits,
			},
		} );

		dispatcherCallback( {
			action: {
				type: 'RECEIVE_POST_BEING_EDITED',
				post: assign( { ID: 1234 }, postEdits ),
			},
		} );

		assert( PostEditStore.isNew() === false );
		assert( PostEditStore.getSavedPost().title === postEdits.title );
		assert( PostEditStore.getSavedPost().content === postEdits.content );
		assert( PostEditStore.get().title === postEdits.title );
		assert( PostEditStore.get().content === postEdits.content );
		assert( PostEditStore.getChangedAttributes().title === undefined );
		assert( PostEditStore.getChangedAttributes().content === undefined );
		assert( PostEditStore.getChangedAttributes().metadata === undefined );
	} );

	test( 'resets raw content when receiving an updated post', () => {
		dispatcherCallback( {
			action: {
				type: 'RECEIVE_POST_TO_EDIT',
				post: { content: 'bar' },
			},
		} );

		dispatcherCallback( {
			action: {
				type: 'EDIT_POST_RAW_CONTENT',
				content: 'foo',
			},
		} );

		dispatcherCallback( {
			action: {
				type: 'RECEIVE_POST_BEING_EDITED',
				post: { content: 'bar' },
			},
		} );

		assert( ! PostEditStore.isDirty() );
	} );

	test( 'resets raw content on RESET_POST_RAW_CONTENT', () => {
		dispatcherCallback( {
			action: {
				type: 'EDIT_POST_RAW_CONTENT',
				content: 'foo',
			},
		} );

		dispatcherCallback( {
			action: {
				type: 'EDIT_POST_RAW_CONTENT',
				content: 'bar',
			},
		} );

		dispatcherCallback( {
			action: {
				type: 'RESET_POST_RAW_CONTENT',
			},
		} );

		assert( ! PostEditStore.isDirty() );
	} );

	describe( '#setRawContent', () => {
		test( "should not emit a change event if content hasn't changed", () => {
			const onChange = spy();

			dispatcherCallback( {
				action: {
					type: 'RECEIVE_POST_TO_EDIT',
					post: {},
				},
			} );

			PostEditStore.on( 'change', onChange );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: 'foo',
				},
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: 'foo',
				},
			} );

			PostEditStore.off( 'change', onChange );

			assert( ! PostEditStore.isDirty() );
			assert( onChange.callCount === 1 );
		} );
	} );

	describe( '#getChangedAttributes()', () => {
		test( 'includes status for a new post', () => {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					site: {
						ID: 1,
					},
				},
			} );

			assert( PostEditStore.getChangedAttributes().status === 'draft' );
		} );

		test( 'includes all attributes on a new post', () => {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					site: {
						ID: 1,
					},
				},
			} );

			assert(
				isEqual( PostEditStore.getChangedAttributes(), {
					site_ID: 1,
					status: 'draft',
					type: 'post',
					parent_id: null,
					title: '',
					content: '',
				} )
			);
		} );
	} );

	describe( '#isDirty()', () => {
		test( 'returns false for a new post', () => {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					site: {
						ID: 1,
					},
				},
			} );

			assert( ! PostEditStore.isDirty() );
		} );

		test( 'returns false if the edited post is unchanged', () => {
			dispatcherCallback( {
				action: {
					type: 'RECEIVE_POST_TO_EDIT',
					post: {},
				},
			} );

			assert( ! PostEditStore.isDirty() );
		} );

		test( 'returns true if raw content changes over time', () => {
			dispatcherCallback( {
				action: {
					type: 'RECEIVE_POST_TO_EDIT',
					post: {},
				},
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: '',
				},
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: 'foo',
				},
			} );

			assert( PostEditStore.isDirty() );
		} );
	} );

	describe( '#hasContent()', () => {
		test( 'returns false for new post', () => {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					site: {
						ID: 1,
					},
				},
			} );

			assert( PostEditStore.hasContent() === false );
		} );

		test( 'returns true if title is set', () => {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					site: {
						ID: 1,
					},
				},
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST',
					siteId: 1,
					post: { title: 'Draft' },
				},
			} );

			assert( PostEditStore.hasContent() === true );
		} );

		test( 'returns false if title is whitespace', () => {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					site: {
						ID: 1,
					},
				},
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST',
					siteId: 1,
					post: { title: ' ' },
				},
			} );

			assert( PostEditStore.hasContent() === false );
		} );

		test( 'returns true if excerpt is set', () => {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					site: {
						ID: 1,
					},
				},
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST',
					siteId: 1,
					post: { excerpt: 'Excerpt' },
				},
			} );

			assert( PostEditStore.hasContent() === true );
		} );

		test( 'returns false if content includes bogus line break', () => {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					site: {
						ID: 1,
					},
				},
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST',
					siteId: 1,
					post: { content: '<p><br data-mce-bogus="1"></p>' },
				},
			} );

			assert( PostEditStore.hasContent() === false );
		} );

		test( 'returns false if content includes non-breaking space', () => {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					site: {
						ID: 1,
					},
				},
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST',
					siteId: 1,
					post: { content: '<p>&nbsp;</p>' },
				},
			} );

			assert( PostEditStore.hasContent() === false );
		} );

		test( 'returns false if content includes empty paragraph', () => {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					site: {
						ID: 1,
					},
				},
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST',
					siteId: 1,
					post: { content: '<p> </p>' },
				},
			} );

			assert( PostEditStore.hasContent() === false );
		} );

		test( 'returns true if content is set', () => {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					site: {
						ID: 1,
					},
				},
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST',
					siteId: 1,
					post: { content: '<p>Hello World</p>' },
				},
			} );

			assert( PostEditStore.hasContent() === true );
		} );

		test( 'returns true if raw content is set', () => {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					site: {
						ID: 1,
					},
				},
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: '<p>Hello World</p>',
				},
			} );

			assert( PostEditStore.hasContent() === true );
		} );

		test( 'returns false if post content exists, but raw content is empty', () => {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					site: {
						ID: 1,
					},
				},
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST',
					siteId: 1,
					post: { content: '<p>Hello World</p>' },
				},
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: '<p></p>',
				},
			} );

			assert( PostEditStore.hasContent() === false );
		} );
	} );

	describe( 'rawContent', () => {
		afterAll( function() {
			PostEditStore.removeAllListeners();
		} );

		test( "should not trigger changes if isDirty() and hadContent() don't change", () => {
			let called = false;

			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					site: {
						ID: 1,
					},
				},
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: '<p>H</p>',
				},
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: '<p>Hello</p>',
				},
			} );

			function callback() {
				called = true;
			}

			PostEditStore.on( 'change', callback );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: '<p>Hello World!</p>',
				},
			} );

			assert( called === false );
		} );
	} );
} );
