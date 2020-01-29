/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';
import page from 'page';

/**
 * Internal Dependencies
 */

import ChecklistMain from './main';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import isEligibleForDotcomChecklist from 'state/selectors/is-eligible-for-dotcom-checklist';
import canCurrentUserUseCustomerHome from 'state/sites/selectors/can-current-user-use-customer-home';

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

	if ( canCurrentUserUseCustomerHome( state, siteId ) ) {
		page.redirect( `/home/${ slug }${ queryString }` );
		return;
	}

	if ( ! isEligibleForDotcomChecklist( state, siteId ) ) {
		page.redirect( `/plans/my-plan/${ slug }` );
		return;
	}

	next();
}
