/**
 * Internal dependencies
 */
import { eligibilityHolds } from 'state/automated-transfer/constants';

/**
 * Maps the constants used in the WordPress.com API with
 * those used inside of Calypso. Somewhat redundant, this
 * provides safety for when the API changes. We need not
 * changes the constants in the Calypso side, only here
 * in the code directly dealing with the API.
 */
export const statusMapping = {
	multiple_users: eligibilityHolds.MULTIPLE_USERS,
	no_wpcom_nameservers: eligibilityHolds.NO_WPCOM_NAMESERVERS,
	not_using_custom_domain: eligibilityHolds.NOT_USING_CUSTOM_DOMAIN,
	non_admin_user: eligibilityHolds.NON_ADMIN_USER,
	site_graylisted: eligibilityHolds.SITE_GRAYLISTED,
	site_private: eligibilityHolds.SITE_PRIVATE,
};
