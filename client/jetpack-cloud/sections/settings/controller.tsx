/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Credentials from './credentials';
import HostSelection from './host-selection';
import SettingsPage from './main';
import Top from './top';
import { settingsHostSelectionPath } from 'lib/jetpack/paths';

export const settingsToHostSelection: PageJS.Callback = ( context ) => {
	const { site } = context.params;
	page.redirect( settingsHostSelectionPath( site ) );
};

export const withTop = ( step: number ): PageJS.Callback => ( context, next ) => {
	context.primary = <Top step={ step }>{ context.primary }</Top>;
	next();
};

export const settings: PageJS.Callback = ( context, next ) => {
	context.primary = <SettingsPage />;
	next();
};

export const hostSelection: PageJS.Callback = ( context, next ) => {
	context.primary = <HostSelection />;
	next();
};

export const credentials: PageJS.Callback = ( context, next ) => {
	const { host } = context.params;
	context.primary = <Credentials host={ host } />;
	next();
};
