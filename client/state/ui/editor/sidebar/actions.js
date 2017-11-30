/** @format */
/**
 * Internal dependencies
 */
import {
	bumpStat,
	composeAnalytics,
	recordGoogleEvent,
	withAnalytics,
} from 'state/analytics/actions';
import { savePreference } from 'state/preferences/actions';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

export const openEditorSidebar = () => dispatch => {
	dispatch( savePreference( 'editor-sidebar', 'open' ) );
	dispatch(
		withAnalytics(
			composeAnalytics(
				recordGoogleEvent( 'Editor', 'Sidebar Toggle', 'open' ),
				bumpStat( 'editor_actions', 'open-sidebar' )
			),
			setLayoutFocus( 'sidebar' )
		)
	);
};

export const closeEditorSidebar = () => dispatch => {
	dispatch( savePreference( 'editor-sidebar', 'closed' ) );
	dispatch(
		withAnalytics(
			composeAnalytics(
				recordGoogleEvent( 'Editor', 'Sidebar Toggle', 'close' ),
				bumpStat( 'editor_actions', 'close-sidebar' )
			),
			setLayoutFocus( 'content' )
		)
	);
};
