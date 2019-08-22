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
import SectionImport from 'my-sites/importer/section-import';
import {
	setImportingFromSignupFlow,
	setImportingFromSignupFlowAutoStart,
	setImportOriginSiteDetails,
} from 'state/importer-nux/actions';
import { decodeURIComponentIfValid } from 'lib/url';
import { addQueryArgs } from 'lib/route';

export function importSite( context, next ) {
	const { query } = context;
	const argsToExtract = [ 'engine', 'isFromSignup', 'from-site', 'autoStartImport' ];

	// Pull supported query arguments into state (& out of the address bar)
	const extractedArgs = pick( query, argsToExtract );

	if ( ! isEmpty( extractedArgs ) ) {
		const destination = addQueryArgs( omit( query, argsToExtract ), context.pathname );
		page.replace( destination, {
			engine: query.engine,
			isFromSignup: query.signup,
			siteUrl: query[ 'from-site' ],
			autoStartImport: query.autoStartSiteImport,
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

	if ( get( context, 'state.autoStartImport' ) ) {
		context.store.dispatch( setImportingFromSignupFlowAutoStart() );
	}

	context.primary = <SectionImport />;
	next();
}
