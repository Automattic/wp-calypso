/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import i18nUtils from 'client/lib/i18n-utils';
import DomainConnectAuthorize from './domain-connect-authorize';
import DomainConnectNotFoundError from './domain-connect-not-found-error';

export function domainConnectAuthorize( context, next ) {
	context.primary = (
		<DomainConnectAuthorize
			locale={ i18nUtils.getLanguage( context.params.locale ) }
			path={ context.path }
			params={ context.query }
			providerId={ context.params.providerId }
			serviceId={ context.params.serviceId }
		/>
	);
	context.secondary = null;
	next();
}

export function notFoundError( context, next ) {
	context.primary = <DomainConnectNotFoundError />;
	context.secondary = null;
	next();
}
