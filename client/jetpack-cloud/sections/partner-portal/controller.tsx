/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Licenses from './main';
import Sidebar from './sidebar';

export function licenses( context: PageJS.Context, next: () => any ) {
	context.primary = <Licenses path={ context.path } />;
	context.secondary = <Sidebar path={ context.path } />;

	next();
}
