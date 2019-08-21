/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';
import page from 'page';
import { isEnabled } from 'config';

/**
 * Internal Dependencies
 */

import ChecklistMain from './main';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import {
	canCurrentUserUseCustomerHome,
	canCurrentUserUseChecklistMenu,
} from 'state/sites/selectors';

export function show( context, next ) {
	const displayMode = get( context, 'query.d' );
	context.primary = <ChecklistMain displayMode={ displayMode } />;
	next();
}

export function maybeRedirect( context, next ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const slug = getSelectedSiteSlug( state );
	const queryString = context.querystring ? `?${ context.querystring }` : '';

	if ( isEnabled( 'customer-home' ) && canCurrentUserUseCustomerHome( state, siteId ) ) {
		page.redirect( `/home/${ slug }${ queryString }` );
		return;
	}

	if ( ! canCurrentUserUseChecklistMenu( state, siteId ) ) {
		page.redirect( `/plans/my-plan/${ slug }` );
		return;
	}

	next();
}
