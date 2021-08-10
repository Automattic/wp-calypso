/**
 * Internal dependencies
 */
import { ROUTE_CLEAR_LAST_NON_EDITOR, ROUTE_SET } from 'calypso/state/action-types';

export type Query = {
	[ key: string ]: string | number | undefined;
	_timestamp?: number;
};

export type QueryState = {
	initial: Query | false;
	current: Query | false;
	previous: Query | false;
};

export type Path = string;

export type PathState = {
	initial: Path;
	current: Path;
	previous: Path;
};

export type RouteState = {
	path: PathState;
	query: QueryState;
};

type RouteClearAction = {
	type: typeof ROUTE_CLEAR_LAST_NON_EDITOR;
};

type RouteSetAction = {
	path: Path;
	query: Query;
	type: typeof ROUTE_SET;
};

export type RouteClearActionCreator = () => RouteClearAction;

export type RouteSetActionCreator = (
	path: RouteSetAction[ 'path' ],
	query: RouteSetAction[ 'query' ]
) => RouteSetAction;
