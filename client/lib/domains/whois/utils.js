import { whoisType } from './constants';

export function findRegistrantWhois( whoisContacts ) {
	return whoisContacts?.find( ( item ) => item.type === whoisType.REGISTRANT );
}

export function findPrivacyServiceWhois( whoisContacts ) {
	return whoisContacts?.find( ( item ) => item.type === whoisType.PRIVACY_SERVICE );
}
