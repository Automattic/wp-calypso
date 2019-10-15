/**
 * External dependencies
 */
import React from 'react';
import config from 'config';
import page from 'page';

/**
 * Internal dependencies
 */
import Editor from './editor';
import { hideMasterbar as hideMasterbarAction } from 'state/ui/actions';

export const redirectIfNotEnabled: PageJS.Callback = ( context, next ) => {
	if ( ! config.isEnabled( 'gutenboarding' ) ) {
		page.redirect( '/' );
		return;
	}
	next();
};

export const hideMasterbar: PageJS.Callback = ( context, next ) => {
	context.store.dispatch( hideMasterbarAction() );
	next();
};

export const main: PageJS.Callback = ( context, next ) => {
	context.primary = <Editor />;
	next();
};
