/**
 * External dependencies
 */
import { expect } from 'chai';
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import {
	ANALYTICS_STAT_BUMP,
	EDITOR_POST_ID_SET,
	EDITOR_SHOW_DRAFTS_TOGGLE,
	EDITOR_START
} from 'state/action-types';
import {
	MODAL_VIEW_STAT_MAPPING,
	setEditorPostId,
	toggleEditorDraftsVisible,
	setEditorMediaModalView,
	startPostEditor
} from '../actions';
import { setMediaModalView } from 'state/ui/media-modal/actions';

describe( 'actions', () => {
	describe( '#setEditorPostId()', () => {
		it( 'should return an action object', () => {
			const action = setEditorPostId( 183 );

			expect( action ).to.eql( {
				type: EDITOR_POST_ID_SET,
				postId: 183
			} );
		} );
	} );

	describe( 'startPostEditor()', () => {
		it( 'should return an action object', () => {
			const action = startPostEditor( 10, 183 );

			expect( action ).to.eql( {
				type: EDITOR_START,
				siteId: 10,
				postId: 183
			} );
		} );
	} );

	describe( '#toggleEditorDraftsVisible()', () => {
		it( 'should return an action object', () => {
			const action = toggleEditorDraftsVisible();

			expect( action ).to.eql( {
				type: EDITOR_SHOW_DRAFTS_TOGGLE
			} );
		} );
	} );

	describe( 'setEditorMediaModalView()', () => {
		it( 'should dispatch setMediaModalView with analytics', () => {
			forEach( MODAL_VIEW_STAT_MAPPING, ( stat, view ) => {
				expect( setEditorMediaModalView( view ) ).to.eql( {
					...setMediaModalView( view ),
					meta: {
						analytics: [ {
							type: ANALYTICS_STAT_BUMP,
							payload: {
								group: 'editor_media_actions',
								name: stat
							}
						} ]
					}
				} );
			} );
		} );
	} );
} );
