/** @format */
/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { whoisType } from './constants';

function findRegistrantWhois( whoisContacts ) {
	return find( whoisContacts, { type: whoisType.REGISTRANT } );
}

function findPrivacyServiceWhois( whoisContacts ) {
	return find( whoisContacts, { type: whoisType.PRIVACY_SERVICE } );
}

export default {
	findRegistrantWhois,
	findPrivacyServiceWhois,
};
