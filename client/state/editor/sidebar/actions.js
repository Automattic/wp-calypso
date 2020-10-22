/**
 * Internal dependencies
 */
import {
	bumpStat,
	composeAnalytics,
	recordGoogleEvent,
	withAnalytics,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';

import 'calypso/state/editor/init';

export const openEditorSidebar = () => ( dispatch ) => {
	dispatch( savePreference( 'editor-sidebar', 'open' ) );
	dispatch(
		withAnalytics(
			composeAnalytics(
				recordTracksEvent( 'calypso_editor_sidebar_toggle_open' ),
				recordGoogleEvent( 'Editor', 'Sidebar Toggle', 'open' ),
				bumpStat( 'editor_actions', 'open-sidebar' )
			),
			setLayoutFocus( 'sidebar' )
		)
	);
};

export const closeEditorSidebar = () => ( dispatch ) => {
	dispatch( savePreference( 'editor-sidebar', 'closed' ) );
	dispatch(
		withAnalytics(
			composeAnalytics(
				recordTracksEvent( 'calypso_editor_sidebar_toggle_close' ),
				recordGoogleEvent( 'Editor', 'Sidebar Toggle', 'close' ),
				bumpStat( 'editor_actions', 'close-sidebar' )
			),
			setLayoutFocus( 'content' )
		)
	);
};
