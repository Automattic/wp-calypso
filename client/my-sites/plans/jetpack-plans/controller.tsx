/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AsyncLoad from 'calypso/components/async-load';
import getCurrentPlanTerm from 'calypso/state/selectors/get-current-plan-term';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { TERM_ANNUALLY } from '@automattic/calypso-products';

/**
 * Type dependencies
 */
import type { Duration, QueryArgs } from './types';

export const productSelect = ( rootUrl: string ): PageJS.Callback => ( context, next ) => {
	// Get the selected site's current plan term, and set it as default duration
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const duration: Duration =
		( siteId && ( getCurrentPlanTerm( state, siteId ) as Duration ) ) ||
		( TERM_ANNUALLY as Duration );
	const urlQueryArgs: QueryArgs = context.query;

	context.primary = (
		<AsyncLoad
			require="./selector"
			defaultDuration={ duration }
			rootUrl={ rootUrl }
			siteSlug={ context.params.site || context.query.site }
			urlQueryArgs={ urlQueryArgs }
			header={ context.header }
			footer={ context.footer }
		/>
	);

	next();
};
