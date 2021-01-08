/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Analytics from './analytics';
import Licenses from './licenses';
import Logs from './logs';
import Settings from './settings';
import Sidebar from './sidebar';

export function analytics( context: PageJS.Context, next: () => any ) {
	context.primary = <Analytics path={ context.path } />;
	context.secondary = <Sidebar path={ context.path } />;

	next();
}

export function licenses( context: PageJS.Context, next: () => any ) {
	context.primary = <Licenses path={ context.path } />;
	context.secondary = <Sidebar path={ context.path } />;

	next();
}

export function logs( context: PageJS.Context, next: () => any ) {
	context.primary = <Logs path={ context.path } />;
	context.secondary = <Sidebar path={ context.path } />;

	next();
}

export function settings( context: PageJS.Context, next: () => any ) {
	context.primary = <Settings path={ context.path } />;
	context.secondary = <Sidebar path={ context.path } />;

	next();
}
