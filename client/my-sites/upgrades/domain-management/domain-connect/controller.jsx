/**
 * External dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import i18nUtils from 'lib/i18n-utils';
import DomainConnectAuthorize from './domain-connect-authorize';
import DomainConnectNotFoundError from './domain-connect-not-found-error';
import LayoutLoggedOut from 'layout/logged-out';
import config from 'config';

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

export function notFoundError( err, context, next ) {
console.log( 'blerg-not-found' );
console.log( err );
console.log( context );
console.log( next );

	context.layout = (
		<ReduxProvider store={ context.store }>
			<LayoutLoggedOut primary={ <DomainConnectNotFoundError /> } />
		</ReduxProvider>
	);

	next( err );
}
