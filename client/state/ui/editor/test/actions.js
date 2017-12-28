/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import {
	MODAL_VIEW_STAT_MAPPING,
	setEditorMediaModalView,
	startEditingPost,
	stopEditingPost,
} from '../actions';
import { ANALYTICS_STAT_BUMP, EDITOR_START, EDITOR_STOP } from 'client/state/action-types';
import { setMediaModalView } from 'client/state/ui/media-modal/actions';

describe( 'actions', () => {
	describe( 'startEditingPost()', () => {
		test( 'should return an action object', () => {
			const action = startEditingPost( 10, 183, 'post' );

			expect( action ).to.eql( {
				type: EDITOR_START,
				siteId: 10,
				postId: 183,
				postType: 'post',
			} );
		} );
	} );

	describe( 'stopEditingPost()', () => {
		test( 'should return an action object', () => {
			const action = stopEditingPost( 10, 183 );

			expect( action ).to.eql( {
				type: EDITOR_STOP,
				siteId: 10,
				postId: 183,
			} );
		} );
	} );

	describe( 'setEditorMediaModalView()', () => {
		test( 'should dispatch setMediaModalView with analytics', () => {
			forEach( MODAL_VIEW_STAT_MAPPING, ( stat, view ) => {
				expect( setEditorMediaModalView( view ) ).to.eql( {
					...setMediaModalView( view ),
					meta: {
						analytics: [
							{
								type: ANALYTICS_STAT_BUMP,
								payload: {
									group: 'editor_media_actions',
									name: stat,
								},
							},
						],
					},
				} );
			} );
		} );
	} );
} );
