/**
 * External dependencies
 */
import { expect } from 'chai';
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import { MODAL_VIEW_STAT_MAPPING, setEditorMediaModalView } from '../actions';
import { ANALYTICS_STAT_BUMP } from 'calypso/state/action-types';
import { setMediaModalView } from 'calypso/state/ui/media-modal/actions';

describe( 'actions', () => {
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
