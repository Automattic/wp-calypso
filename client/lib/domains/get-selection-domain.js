/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { type as domainTypes } from './constants';

export function getSelectedDomain( { domains, selectedDomainName, isTransfer } ) {
	return find( domains, ( domain ) => {
		if ( domain.name !== selectedDomainName ) {
			return false;
		}

		if ( isTransfer && domain.type === domainTypes.TRANSFER ) {
			return true;
		}

		return domain.type !== domainTypes.TRANSFER;
	} );
}
