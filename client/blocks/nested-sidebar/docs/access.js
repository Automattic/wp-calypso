// We would need to build a mapping of sidebar routes to their components + other details
import { has, get } from 'lodash';

const sidebarRouteData = {};

export const isValidRouteData = data => has( data, 'component' );

// returns object
export const getRouteData = route =>
	get( sidebarRouteData, route, {} );

export const getRouteComponent = route =>
	get( sidebarRouteData[ route ], 'component', null );


export const setRouteData = ( route, data ) =>
	isValidRouteData( data )
		? ( sidebarRouteData[ route ] = data ) && true
		: false;

// This file, or at least the methods of this file definitely need to find a new home and new name!