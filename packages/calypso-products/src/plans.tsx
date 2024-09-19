import i18n from 'i18n-calypso';

/**
 * Extracted functions to avoid Calypso apps from depending on the PLANS_LIST object.
 * See: p7H4VZ-4S4-p2
 */

export const getPlanPersonalTitle = () =>
	// translators: Personal is a plan name
	i18n.translate( 'Personal' );

export const getPlanPremiumTitle = () =>
	// translators: Premium is a plan name
	i18n.translate( 'Premium' );

export const getPlanBusinessTitle = () =>
	// translators: Business is a plan name
	i18n.translate( 'Business' );

export const getPlanEcommerceTitle = () =>
	// translators: Commerce is a plan name
	i18n.translate( 'Commerce' );

export const getPlanBusinessTrialTitle = () =>
	// translators: Business Trial is a plan name
	i18n.translate( 'Business Trial' );

export const getPlanBusinessTrialTagline = () =>
	// translators: Business is a plan name
	i18n.translate( 'Try all the features of our Business plan.' );

export const getPlanCommerceTrialTitle = () =>
	// translators: Commerce Trial is a plan name
	i18n.translate( 'Commerce Trial' );
