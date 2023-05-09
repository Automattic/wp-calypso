import { find } from 'lodash';
import { whoisType } from './constants';

export function findRegistrantWhois( whoisContacts ) {
	return find( whoisContacts, { type: whoisType.REGISTRANT } );
}

export function findPrivacyServiceWhois( whoisContacts ) {
	return find( whoisContacts, { type: whoisType.PRIVACY_SERVICE } );
}
