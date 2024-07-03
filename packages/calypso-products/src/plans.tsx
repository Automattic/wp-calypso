import i18n from 'i18n-calypso';
import { getPlansListExperiment } from './experiments';

/**
 * Extracted functions to avoid Calypso apps from depending on the PLANS_LIST object.
 * See: p7H4VZ-4S4-p2
 */

export const getPlanPersonalTitle = () =>
	getPlansListExperiment( 'wpcom_plan_name_change_personal_premium_v1' ) === 'treatment'
		? // translators: Personal is a plan name
		  i18n.translate( 'Personal' )
		: // translators: Starter is a plan name
		  i18n.translate( 'Starter' );

export const getPlanPremiumTitle = () =>
	getPlansListExperiment( 'wpcom_plan_name_change_personal_premium_v1' ) === 'treatment'
		? // translators: Premium is a plan name
		  i18n.translate( 'Premium' )
		: // translators: Explorer is a plan name
		  i18n.translate( 'Explorer' );

export const getPlanBusinessTitle = () =>
	getPlansListExperiment( 'wpcom_plan_name_change_personal_premium_v1' ) === 'treatment'
		? // translators: Business is a plan name
		  i18n.translate( 'Business' )
		: // translators: Creator is a plan name
		  i18n.translate( 'Creator' );

export const getPlanEcommerceTitle = () =>
	getPlansListExperiment( 'wpcom_plan_name_change_personal_premium_v1' ) === 'treatment'
		? // translators: Commerce is a plan name
		  i18n.translate( 'Commerce' )
		: // translators: Entrepreneur is a plan name
		  i18n.translate( 'Entrepreneur' );

export const getPlanBusinessTrialTitle = () =>
	getPlansListExperiment( 'wpcom_plan_name_change_personal_premium_v1' ) === 'treatment'
		? // translators: Business Trial is a plan name
		  i18n.translate( 'Business Trial' )
		: // translators: Creator Trial is a plan name
		  i18n.translate( 'Creator Trial' );

export const getPlanBusinessTrialTagline = () =>
	getPlansListExperiment( 'wpcom_plan_name_change_personal_premium_v1' ) === 'treatment'
		? // translators: Business is a plan name
		  i18n.translate( 'Try all the features of our Business plan.' )
		: // translators: Creator is a plan name
		  i18n.translate( 'Try all the features of our Creator plan.' );

export const getPlanCommerceTrialTitle = () =>
	getPlansListExperiment( 'wpcom_plan_name_change_personal_premium_v1' ) === 'treatment'
		? // translators: Commerce Trial is a plan name
		  i18n.translate( 'Commerce Trial' )
		: // translators: Entrepreneur Trial is a plan name
		  i18n.translate( 'Entrepreneur Trial' );
