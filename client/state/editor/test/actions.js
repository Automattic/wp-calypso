/**
 * External dependencies
 */
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import { MODAL_VIEW_STATS, setEditorMediaModalView } from '../actions';
import { ANALYTICS_STAT_BUMP } from 'calypso/state/action-types';
import { setMediaModalView } from 'calypso/state/ui/media-modal/actions';

describe( 'actions', () => {
	describe( 'setEditorMediaModalView()', () => {
		test( 'should dispatch setMediaModalView with analytics', () => {
			expect.assertions( Object.entries( MODAL_VIEW_STATS ).length );
			forEach( MODAL_VIEW_STATS, ( stat, view ) => {
				expect( setEditorMediaModalView( view ) ).toEqual( {
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
