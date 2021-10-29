/**
 * External dependencies
 */
import { Action } from 'redux';

export type Query = {
	[ key: string ]: string | number | undefined;
	_timestamp?: number;
};

export type QueryState = {
	initial: Query | false;
	current: Query | false;
	previous: Query | false;
};

export type PathState = {
	initial: string;
	current: string;
	previous: string;
};

export type RouteState = {
	lastNonEditorRoute: string;
	path: PathState;
	query: QueryState;
};

export type RouteClearActionCreator = () => Action;

export type RouteSetActionCreator = ( path: string, query: Query ) => Action;
