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
	EDITOR_START,
	EDITOR_STOP,
} from 'state/action-types';
import {
	MODAL_VIEW_STAT_MAPPING,
	setEditorMediaModalView,
	startEditingPost,
	stopEditingPost,
} from '../actions';
import { setMediaModalView } from 'state/ui/media-modal/actions';

describe( 'actions', () => {
	describe( 'startEditingPost()', () => {
		it( 'should return an action object', () => {
			const action = startEditingPost( 10, 183, 'post' );

			expect( action ).to.eql( {
				type: EDITOR_START,
				siteId: 10,
				postId: 183,
				postType: 'post'
			} );
		} );
	} );

	describe( 'stopEditingPost()', () => {
		it( 'should return an action object', () => {
			const action = stopEditingPost( 10, 183 );

			expect( action ).to.eql( {
				type: EDITOR_STOP,
				siteId: 10,
				postId: 183
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
