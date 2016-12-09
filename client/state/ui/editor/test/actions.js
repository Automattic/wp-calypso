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
	EDITOR_SHOW_DRAFTS_TOGGLE
} from 'state/action-types';
import {
	MODAL_VIEW_STAT_MAPPING,
	setEditorPostId,
	toggleEditorDraftsVisible,
	setEditorMediaModalView
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
