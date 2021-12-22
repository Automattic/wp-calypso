import { find } from 'lodash';
import { type as domainTypes } from './constants';

/**
 * @param {{domains: import('calypso/lib/domains/types').ResponseDomain[], selectedDomainName: string, isSiteRedirect?: boolean}} props
 * @returns {import('calypso/lib/domains/types').ResponseDomain|undefined}
 */
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
