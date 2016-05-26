/**
 * External dependencies
 */
import assert from 'assert';
import assign from 'lodash/assign';
import isEqual from 'lodash/isEqual';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'post-edit-store', function() {
	let Dispatcher, PostEditStore, dispatcherCallback;

	useFakeDom();

	// makes sure we always load fresh instance of Dispatcher
	useMockery();

	before( () => {
		Dispatcher = require( 'dispatcher' );
		spy( Dispatcher, 'register' );
		PostEditStore = require( '../post-edit-store' );
		dispatcherCallback = Dispatcher.register.lastCall.args[ 0 ];
	} );

	after( () => {
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
							name: 'Unicorns'
						}
					}
				}
			}
		} );
	}

	function dispatchCreateTerm( createNewDraft, postId ) {
		if ( createNewDraft ) {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 123
				}
			} );
		}

		dispatcherCallback( {
			action: {
				type: 'CREATE_TERM',
				id: 'default',
				siteId: 123,
				data: {
					termType: 'categories',
					terms: [ {
						name: 'wookies',
						ID: 'temporary-0',
						postId: postId
					} ]
				},
				error: null
			}
		} );
	}

	function dispatchReceiveAddTerm() {
		dispatcherCallback( {
			action: {
				type: 'RECEIVE_ADD_TERM',
				id: 'default',
				siteId: 123,
				data: {
					termType: 'categories',
					terms: [ {
						ID: 787,
						name: 'wookies',
						temporaryId: 'temporary-0'
					} ]
				},
				error: null
			}
		} );
	}

	it( 'initializes new draft post properly', function() {
		var siteId = 1234,
			post;

		dispatcherCallback( {
			action: {
				type: 'DRAFT_NEW_POST',
				siteId: siteId
			}
		} );

		assert( PostEditStore.getSavedPost().ID === undefined );
		assert( PostEditStore.getSavedPost().site_ID === siteId );
		post = PostEditStore.get();
		assert( post.status === 'draft' );
		assert( PostEditStore.isNew() );
	} );

	it( 'initialize existing post', function() {
		var siteId = 12,
			postId = 345;

		dispatcherCallback( {
			action: {
				type: 'START_EDITING_POST',
				siteId: siteId,
				postId: postId
			}
		} );

		assert( ! PostEditStore.isNew() );
	} );

	it( 'sets category_ids array properly', function() {
		var post;

		dispatchReceivePost();
		post = PostEditStore.get();
		assert( post.ID === 777 );
		assert( Array.isArray( post.category_ids ) );
		assert( post.category_ids[ 0 ] === 199 );
	} );

	it( 'sets parent_id properly', function() {
		var post;

		dispatchReceivePost();
		post = PostEditStore.get();
		assert( post.parent_id === null );
	} );

	it( 'decodes entities on received post title', function() {
		dispatcherCallback( {
			action: {
				type: 'DRAFT_NEW_POST',
				title: 'Ribs &amp; Chicken'
			}
		} );

		assert( PostEditStore.get().title === 'Ribs & Chicken' );
	} );

	it( 'updates parent_id after a set', function() {
		var post;
		dispatchReceivePost();
		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: {
					parent: 101
				}
			}
		} );

		post = PostEditStore.get();
		assert( post.parent_id, 101 );
	} );

	it( 'sets category_ids on EDIT_POST', function() {
		var post;
		dispatchReceivePost();
		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: {
					categories: [ 200, 201 ]
				}
			}
		} );
		post = PostEditStore.get();
		assert( post.category_ids[ 0 ] === 200 );
	} );

	it( 'does not decode post title entities on EDIT_POST', function() {
		dispatcherCallback( {
			action: {
				type: 'DRAFT_NEW_POST'
			}
		} );

		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: {
					title: 'Ribs &gt; Chicken'
				}
			}
		} );

		assert( PostEditStore.get().title === 'Ribs &gt; Chicken' );
	} );

	it( 'decodes post title entities on RECEIVE_POST_BEING_EDITED', function() {
		dispatcherCallback( {
			action: {
				type: 'DRAFT_NEW_POST'
			}
		} );

		dispatcherCallback( {
			action: {
				type: 'RECEIVE_POST_BEING_EDITED',
				post: {
					title: 'Ribs &gt; Chicken'
				}
			}
		} );

		assert( PostEditStore.get().title === 'Ribs > Chicken' );
	} );

	it( 'reset on stop editing', function() {
		dispatcherCallback( {
			action: {
				type: 'DRAFT_NEW_POST',
				siteId: 1234
			}
		} );

		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: {
					title: 'hello, world!',
					content: 'initial edit'
				}
			}
		} );

		dispatcherCallback( {
			action: {
				type: 'STOP_EDITING_POST'
			}
		} );

		assert( PostEditStore.get() === null );
		assert( PostEditStore.getSavedPost() === null );
	} );

	it( 'updates attributes on edit', function() {
		var siteId = 1234,
			postEdits = {
				title: 'hello, world!',
				content: 'initial edit',
				metadata: [
					{ key: 'super', value: 'duper', operation: 'update' }
				]
			};

		dispatcherCallback( {
			action: {
				type: 'DRAFT_NEW_POST',
				siteId: siteId
			}
		} );

		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: postEdits
			}
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

	it( 'preserves attributes when update is in-flight', function() {
		var siteId = 1234,
			initialPost = {
				ID: 2345,
				title: 'hello, world!',
				content: 'initial edit'
			},
			updates = {
				content: 'updated content'
			};

		dispatcherCallback( {
			action: {
				type: 'DRAFT_NEW_POST',
				siteId: siteId
			}
		} );
		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: initialPost
			}
		} );
		dispatcherCallback( {
			action: {
				type: 'EDIT_POST_SAVE'
			}
		} );

		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: updates
			}
		} );
		dispatcherCallback( {
			action: {
				type: 'RECEIVE_POST_BEING_EDITED',
				post: initialPost
			}
		} );

		assert( PostEditStore.get().content === updates.content );
		assert( PostEditStore.isDirty() );
	} );

	it( 'excludes metadata without an operation on edit', function() {
		var postEdits = {
				title: 'Super Duper',
				metadata: [
					{ key: 'super', value: 'duper', operation: 'update' },
					{ key: 'foo', value: 'bar', operation: 'delete' },
					{ key: 'bar', value: 'foo' }
				]
			},
			expectedMetadata = [
				{ key: 'super', value: 'duper', operation: 'update' },
				{ key: 'foo', value: 'bar', operation: 'delete' }
			];

		dispatcherCallback( {
			action: {
				type: 'RECEIVE_POST_TO_EDIT',
				post: {}
			}
		} );

		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: postEdits
			}
		} );

		assert( PostEditStore.get().metadata === postEdits.metadata );
		assert( PostEditStore.get().title === postEdits.title );
		assert( PostEditStore.getChangedAttributes().title === postEdits.title );
		assert( isEqual( PostEditStore.getChangedAttributes().metadata, expectedMetadata ) );
	} );

	it( 'reset post after saving an edit', function() {
		var siteId = 1234,
			postEdits = {
				title: 'hello, world!',
				content: 'initial edit'
			};

		dispatcherCallback( {
			action: {
				type: 'DRAFT_NEW_POST',
				siteId: siteId
			}
		} );

		dispatcherCallback( {
			action: {
				type: 'EDIT_POST',
				post: postEdits
			}
		} );

		dispatcherCallback( {
			action: {
				type: 'RECEIVE_POST_BEING_EDITED',
				post: assign( { ID: 1234 }, postEdits )
			}
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

	it( 'resets raw content when receiving an updated post', function() {
		dispatcherCallback( {
			action: {
				type: 'RECEIVE_POST_TO_EDIT',
				post: { content: 'bar' }
			}
		} );

		dispatcherCallback( {
			action: {
				type: 'EDIT_POST_RAW_CONTENT',
				content: 'foo'
			}
		} );

		dispatcherCallback( {
			action: {
				type: 'RECEIVE_POST_BEING_EDITED',
				post: { content: 'bar' }
			}
		} );

		assert( ! PostEditStore.isDirty() );
	} );

	it( 'resets raw content on RESET_POST_RAW_CONTENT', function() {
		dispatcherCallback( {
			action: {
				type: 'EDIT_POST_RAW_CONTENT',
				content: 'foo'
			}
		} );

		dispatcherCallback( {
			action: {
				type: 'EDIT_POST_RAW_CONTENT',
				content: 'bar'
			}
		} );

		dispatcherCallback( {
			action: {
				type: 'RESET_POST_RAW_CONTENT'
			}
		} );

		assert( ! PostEditStore.isDirty() );
	} );

	describe( '#setRawContent', function() {
		it( 'should not emit a change event if content hasn\'t changed', function() {
			var onChange = spy();

			dispatcherCallback( {
				action: {
					type: 'RECEIVE_POST_TO_EDIT',
					post: {}
				}
			} );

			PostEditStore.on( 'change', onChange );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: 'foo'
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: 'foo'
				}
			} );

			PostEditStore.off( 'change', onChange );

			assert( ! PostEditStore.isDirty() );
			assert( onChange.callCount === 1 );
		} );
	} );

	describe( '#getChangedAttributes()', function() {
		it( 'includes status for a new post', function() {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			assert( PostEditStore.getChangedAttributes().status === 'draft' );
		} );

		it( 'includes all attributes on a new post', function() {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			assert( isEqual( PostEditStore.getChangedAttributes(), {
				site_ID: 1,
				status: 'draft',
				type: 'post',
				parent_id: null,
				title: '',
				content: '',
				slug: null
			} ) );
		} );
	} );

	describe( '#isDirty()', function() {
		it( 'returns false for a new post', function() {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			assert( ! PostEditStore.isDirty() );
		} );

		it( 'returns false if the edited post is unchanged', function() {
			dispatcherCallback( {
				action: {
					type: 'RECEIVE_POST_TO_EDIT',
					post: {}
				}
			} );

			assert( ! PostEditStore.isDirty() );
		} );

		it( 'returns true if raw content changes over time', function() {
			dispatcherCallback( {
				action: {
					type: 'RECEIVE_POST_TO_EDIT',
					post: {}
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: ''
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: 'foo'
				}
			} );

			assert( PostEditStore.isDirty() );
		} );
	} );

	describe( '#isSaveBlocked()', function() {
		it( 'returns false for new post', function() {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			assert( PostEditStore.isSaveBlocked() === false );
		} );

		it( 'returns true if blocked and no key provided', function() {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'BLOCK_EDIT_POST_SAVE',
					key: 'foo'
				}
			} );

			assert( PostEditStore.isSaveBlocked() === true );
		} );

		it( 'returns false if blocked but not by provided key', function() {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'BLOCK_EDIT_POST_SAVE',
					key: 'foo'
				}
			} );

			assert( PostEditStore.isSaveBlocked( 'bar' ) === false );
		} );

		it( 'returns true if blocked by provided key', function() {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'BLOCK_EDIT_POST_SAVE',
					key: 'foo'
				}
			} );

			assert( PostEditStore.isSaveBlocked( 'foo' ) === true );
		} );
	} );

	describe( '#hasContent()', function() {
		it( 'returns false for new post', function() {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			assert( PostEditStore.hasContent() === false );
		} );

		it( 'returns true if title is set', function() {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST',
					siteId: 1,
					post: { title: 'Draft' }
				}
			} );

			assert( PostEditStore.hasContent() === true );
		} );

		it( 'returns false if title is whitespace', function() {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST',
					siteId: 1,
					post: { title: ' ' }
				}
			} );

			assert( PostEditStore.hasContent() === false );
		} );

		it( 'returns true if excerpt is set', function() {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST',
					siteId: 1,
					post: { excerpt: 'Excerpt' }
				}
			} );

			assert( PostEditStore.hasContent() === true );
		} );

		it( 'returns false if content includes bogus line break', function() {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST',
					siteId: 1,
					post: { content: '<p><br data-mce-bogus="1"></p>' }
				}
			} );

			assert( PostEditStore.hasContent() === false );
		} );

		it( 'returns false if content includes non-breaking space', function() {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST',
					siteId: 1,
					post: { content: '<p>&nbsp;</p>' }
				}
			} );

			assert( PostEditStore.hasContent() === false );
		} );

		it( 'returns false if content includes empty paragraph', function() {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST',
					siteId: 1,
					post: { content: '<p> </p>' }
				}
			} );

			assert( PostEditStore.hasContent() === false );
		} );

		it( 'returns true if content is set', function() {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST',
					siteId: 1,
					post: { content: '<p>Hello World</p>' }
				}
			} );

			assert( PostEditStore.hasContent() === true );
		} );

		it( 'returns true if raw content is set', function() {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: '<p>Hello World</p>'
				}
			} );

			assert( PostEditStore.hasContent() === true );
		} );

		it( 'returns false if post content exists, but raw content is empty', function() {
			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST',
					siteId: 1,
					post: { content: '<p>Hello World</p>' }
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: '<p></p>'
				}
			} );

			assert( PostEditStore.hasContent() === false );
		} );
	} );

	describe( 'TermActions', function() {
		it( 'should add temporary cateogry on CREATE_TERM', function() {
			var post;
			dispatchCreateTerm( true );
			post = PostEditStore.get();
			assert( post.category_ids.length === 1 );
			assert( post.category_ids[ 0 ] === 'temporary-0' );
		} );

		it( 'should replace temporary id on RECEIVE_ADD_TERM', function() {
			var post;
			dispatchCreateTerm( true );
			dispatchReceiveAddTerm();
			post = PostEditStore.get();

			assert( post.category_ids.length === 1 );
			assert( post.category_ids[ 0 ] === 787 );
		} );

		it( 'should add to existing category_ids on CREATE_TERM if transient postId is null', function() {
			var post;
			dispatchReceivePost();
			dispatchCreateTerm();
			post = PostEditStore.get();
			assert( post.category_ids.length === 2 );
			assert( post.category_ids[ 1 ] === 'temporary-0' );
		} );

		it( 'should not add to existing category_ids on CREATE_TERM if transient postId does not match', function() {
			var post;
			dispatchReceivePost();
			dispatchCreateTerm( false, 9999 );
			post = PostEditStore.get();
			assert( post.category_ids.length === 1 );
		} );
	} );

	describe( 'slugs', function() {
		it( 'should use existing slug on puglished posts', function() {
			var post;
			dispatcherCallback( {
				action: {
					type: 'RECEIVE_POST_TO_EDIT',
					post: {
						ID: 777,
						site_ID: 123,
						title: 'Super Slug',
						slug: 'super-rad-slug',
						status: 'publish',
						other_URLs: {
							suggested_slug: 'no-slugs-for-you'
						}
					}
				}
			} );
			post = PostEditStore.get();
			assert( post.slug === 'super-rad-slug' );
		} );

		it( 'should use new suggested slug if prior _savedPost did', function() {
			var post;
			dispatcherCallback( {
				action: {
					type: 'RECEIVE_POST_TO_EDIT',
					post: {
						ID: 777,
						site_ID: 123,
						title: 'Oh My Slugness',
						status: 'draft',
						slug: 'oh-my-slugness',
						other_URLs: {
							suggested_slug: 'oh-my-slugness'
						}

					}
				}
			} );

			post = PostEditStore.get();
			assert( post.slug === 'oh-my-slugness' );

			dispatcherCallback( {
				action: {
					type: 'RECEIVE_POST_BEING_EDITED',
					post: {
						ID: 777,
						site_ID: 123,
						title: 'Oh My Slugness Wat!',
						status: 'draft',
						other_URLs: {
							suggested_slug: 'oh-my-slugness-wat'
						}
					}
				}
			} );

			post = PostEditStore.get();
			assert( post.slug === 'oh-my-slugness-wat' );
		} );

		it( 'should not use suggested slug if a custom one has been set', function() {
			var post;
			dispatcherCallback( {
				action: {
					type: 'RECEIVE_POST_TO_EDIT',
					post: {
						ID: 777,
						site_ID: 123,
						title: 'Too Many Slugs',
						status: 'draft',
						slug: 'too-many-slugs',
						other_URLs: {
							suggested_slug: 'oh-my-slugness'
						}

					}
				}
			} );

			post = PostEditStore.get();
			assert( post.slug === 'too-many-slugs' );

			dispatcherCallback( {
				action: {
					type: 'RECEIVE_POST_BEING_EDITED',
					post: {
						ID: 777,
						site_ID: 123,
						title: 'Too Many Slugs on my API',
						status: 'draft',
						slug: 'sluga-saurus-rex',
						other_URLs: {
							suggested_slug: 'too-many-slugs-on-my-api'
						}
					}
				}
			} );

			post = PostEditStore.get();
			assert( post.slug === 'sluga-saurus-rex' );
		} );
	} );

	describe( 'rawContent', function() {
		after( function() {
			PostEditStore.removeAllListeners();
		} );

		it( 'should not trigger changes if isDirty() and hadContent() don\'t change', function() {
			var called = false;

			dispatcherCallback( {
				action: {
					type: 'DRAFT_NEW_POST',
					siteId: 1
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: '<p>H</p>'
				}
			} );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: '<p>Hello</p>'
				}
			} );

			function callback() {
				called = true;
			}

			PostEditStore.on( 'change', callback );

			dispatcherCallback( {
				action: {
					type: 'EDIT_POST_RAW_CONTENT',
					content: '<p>Hello World!</p>'
				}
			} );

			assert( called === false );
		} );
	} );
} );
