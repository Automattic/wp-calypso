/** @format */
/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import { get, isEmpty, omit, pick } from 'lodash';

/**
 * Internal Dependencies
 */
import AsyncLoad from 'components/async-load';
import { setImportingFromSignupFlow, setImportOriginSiteDetails } from 'state/importer-nux/actions';
import { decodeURIComponentIfValid } from 'lib/url';
import { addQueryArgs } from 'lib/route';

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
			engine: get( context, 'state.engine' ),
			siteUrl: decodeURIComponentIfValid( get( context, 'state.siteUrl' ) ),
		} )
	);

	if ( get( context, 'state.isFromSignup' ) ) {
		context.store.dispatch( setImportingFromSignupFlow() );
	}

	context.primary = <AsyncLoad require="my-sites/importer/section-import" />;
	next();
}
