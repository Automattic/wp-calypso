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
import { EDITOR_NESTED_SIDEBAR_SET } from 'state/action-types';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

export const openEditorSidebar = () => dispatch =>
	dispatch(
		withAnalytics(
			composeAnalytics(
				recordGoogleEvent( 'Editor', 'Sidebar Toggle', 'open' ),
				bumpStat( 'editor_actions', 'open-sidebar' )
			),
			setLayoutFocus( 'sidebar' )
		)
	);

export const closeEditorSidebar = () => dispatch =>
	dispatch(
		withAnalytics(
			composeAnalytics(
				recordGoogleEvent( 'Editor', 'Sidebar Toggle', 'close' ),
				bumpStat( 'editor_actions', 'close-sidebar' )
			),
			setLayoutFocus( 'content' )
		)
	);

export const setNestedSidebar = target => ( {
	type: EDITOR_NESTED_SIDEBAR_SET,
	target,
} );
