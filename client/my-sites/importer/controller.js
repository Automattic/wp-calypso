/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import { get, isEmpty, omit, pick } from 'lodash';

/**
 * Internal Dependencies
 */
import SectionImport from 'calypso/my-sites/importer/section-import';
import {
	setImportingFromSignupFlow,
	setImportOriginSiteDetails,
} from 'calypso/state/importer-nux/actions';
import { decodeURIComponentIfValid } from 'calypso/lib/url';
import { addQueryArgs } from 'calypso/lib/route';

export function importSite( context, next ) {
	const { query } = context;
	const argsToExtract = [ 'engine', 'isFromSignup', 'from-site' ];

	// Pull supported query arguments into state (& out of the address bar)
	const extractedArgs = pick( query, argsToExtract );

	if ( ! isEmpty( extractedArgs ) ) {
		const destination = addQueryArgs( omit( query, argsToExtract ), context.pathname );

		page.replace( destination, {
			engine: query.engine,
			isFromSignup: query.signup,
			siteUrl: query[ 'from-site' ],
		} );
		return;
	}

	context.store.dispatch(
		setImportOriginSiteDetails( {
			siteEngine: get( context, 'state.engine' ),
			siteUrl: decodeURIComponentIfValid( get( context, 'state.siteUrl' ) ),
		} )
	);

	if ( get( context, 'state.isFromSignup' ) ) {
		context.store.dispatch( setImportingFromSignupFlow() );
	}

	context.primary = <SectionImport />;
	next();
}
