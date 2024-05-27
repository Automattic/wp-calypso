import i18n from 'i18n-calypso';
import { getPlansListExperiment } from './experiments';

/**
 * Extracted functions to avoid Calypso apps from depending on the PLANS_LIST object.
 * See: p7H4VZ-4S4-p2
 */

export const getPlanPersonalTitle = () =>
	getPlansListExperiment( 'wpcom_plan_name_change_personal_premium_v1' ) === 'treatment'
		? // translators: Beginner is a plan name
		  i18n.translate( 'Beginner' )
		: // translators: Starter is a plan name
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
