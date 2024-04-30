import i18n from 'i18n-calypso';

/**
 * Extracted functions to avoid Calypso apps from depending on the PLANS_LIST object.
 * See: p7H4VZ-4S4-p2
 */

export const getPlanPersonalTitle = () =>
	// translators: Starter is a plan name
	i18n.translate( 'Starter' );

export const getPlanPremiumTitle = () =>
	// translators: Explorer is a plan name
	i18n.translate( 'Explorer' );

export const getPlanBusinessTitle = () =>
	// translators: Creator is a plan name
	i18n.translate( 'Creator' );

export const getPlanEcommerceTitle = () =>
	// translators: Entrepreneur is a plan name
	i18n.translate( 'Entrepreneur' );
