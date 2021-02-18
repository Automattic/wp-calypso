/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { type as domainTypes } from './constants';

export function getSelectedDomain( { domains, selectedDomainName, isSiteRedirect = false } ) {
	return find( domains, ( domain ) => {
		const isType = ( type ) => domain.type === type;

		if ( domain.name !== selectedDomainName ) {
			return false;
		}

		if ( isSiteRedirect && isType( domainTypes.SITE_REDIRECT ) ) {
			return true;
		}

		return ! isType( domainTypes.SITE_REDIRECT );
	} );
}
