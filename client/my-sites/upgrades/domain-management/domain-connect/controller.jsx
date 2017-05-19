/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import i18nUtils from 'lib/i18n-utils';
import DomainConnectAuthorize from './domain-connect-authorize';

export function domainConnectAuthorize( context, next ) {
	context.primary = (
		<DomainConnectAuthorize
			locale={ i18nUtils.getLanguage( context.params.locale ) }
			path={ context.path }
			params={ context.query }
			provider_id={ context.params.provider_id }
			template_id={ context.params.template_id }
		/>
	);
	context.secondary = null;
	next();
}

export default domainConnectAuthorize;
