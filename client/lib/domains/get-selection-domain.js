/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { type as domainTypes } from './constants';

export function getSelectedDomain( { domains, selectedDomainName, isTransfer, isSiteRedirect } ) {
	return find( domains, ( domain ) => {
		const isType = ( type ) => domain.type === type;

		if ( domain.name !== selectedDomainName ) {
			return false;
		}

		if (
			( isTransfer && isType( domainTypes.TRANSFER ) ) ||
			( isSiteRedirect && isType( domainTypes.SITE_REDIRECT ) )
		) {
			return true;
		}

		return ! ( isType( domainTypes.TRANSFER ) || isType( domainTypes.SITE_REDIRECT ) );
	} );
}
