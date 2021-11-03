/* eslint-disable jsdoc/require-param */
/**
 * Internal dependencies
 */
import 'calypso/state/ui/init';
import { ROUTE_SET, ROUTE_CLEAR_LAST_NON_EDITOR } from 'calypso/state/action-types';
import { RouteClearActionCreator, RouteSetActionCreator } from 'calypso/state/route/types';

/**
 * Returns an action object signalling that the current route is to be changed
 */
export const setRoute: RouteSetActionCreator = ( path, query = {} ) => {
	return {
		type: ROUTE_SET,
		path,
		query,
	};
};

/**
 * Action to forget what the last non-editor route was.
 */
export const clearLastNonEditorRoute: RouteClearActionCreator = () => {
	return {
		type: ROUTE_CLEAR_LAST_NON_EDITOR,
	};
};
