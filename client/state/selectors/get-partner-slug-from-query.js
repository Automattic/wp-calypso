/**
 * Internal dependencies
 */
import getPartnerIdFromQuery from 'state/selectors/get-partner-id-from-query';

/**
 * Returns the partner slug when partner_id is present is the query and the
 * value maps to a known host.
 *
 * @param {object}   state Global state tree
 * @returns {?string}       The partner slug or null
 */
export const getPartnerSlugFromQuery = function ( state ) {
	switch ( getPartnerIdFromQuery( state ) ) {
		case 51945:
		case 51946:
			return 'dreamhost';
		case 49615:
		case 49640:
			return 'pressable';
		case 57152:
		case 57733:
			return 'milesweb';
		case 58712:
		case 58713:
			return 'bluehost';
		case 51652: // Clients used for testing.
			return 'dreamhost';
		case 57039:
			return 'a2hosting';
		case 57304:
		case 57306:
			return 'exabytes';
		case 57836:
			return 'inmotion';
		case 57916:
		case 57917:
			return 'quickclick';
		case 57900:
		case 57901:
			return 'whogohost';
		case 57264:
			return 'wppronto';
		case 57752:
		case 57753:
			return 'wpwebhost';
		case 60178:
		case 60179:
			return 'liquidweb';
		case 65773:
		case 65774:
			return 'eurodns';
		default:
			return null;
	}
};

export default getPartnerSlugFromQuery;
