/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import React from 'react';
import JetpackOnboardingBusinessAddressStep from './steps/business-address';
import JetpackOnboardingContactFormStep from './steps/contact-form';
import JetpackOnboardingHomepageStep from './steps/homepage';
import JetpackOnboardingSiteTitleStep from './steps/site-title';
import JetpackOnboardingSiteTypeStep from './steps/site-type';
import JetpackOnboardingStatsStep from './steps/stats';
import JetpackOnboardingSummaryStep from './steps/summary';
import JetpackOnboardingWoocommerceStep from './steps/woocommerce';

export const JETPACK_ONBOARDING_STEPS = {
	SITE_TITLE: 'site-title',
	SITE_TYPE: 'site-type',
	HOMEPAGE: 'homepage',
	CONTACT_FORM: 'contact-form',
	BUSINESS_ADDRESS: 'business-address',
	WOOCOMMERCE: 'woocommerce',
	STATS: 'stats',
	SUMMARY: 'summary',
};

export const JETPACK_ONBOARDING_STEP_TITLES = {
	[ JETPACK_ONBOARDING_STEPS.SITE_TITLE ]: translate( 'Site Title & Description' ),
	[ JETPACK_ONBOARDING_STEPS.SITE_TYPE ]: translate( 'Type of Site' ),
	[ JETPACK_ONBOARDING_STEPS.HOMEPAGE ]: translate( 'Type of Homepage' ),
	[ JETPACK_ONBOARDING_STEPS.CONTACT_FORM ]: translate( 'Contact Us Form' ),
	[ JETPACK_ONBOARDING_STEPS.BUSINESS_ADDRESS ]: translate( 'Business Address' ),
	[ JETPACK_ONBOARDING_STEPS.WOOCOMMERCE ]: translate( 'Add a Store' ),
	[ JETPACK_ONBOARDING_STEPS.STATS ]: translate( 'Jetpack Stats' ),
	[ JETPACK_ONBOARDING_STEPS.SUMMARY ]: translate( 'Summary' ),
};

export const JETPACK_ONBOARDING_COMPONENTS = {
	[ JETPACK_ONBOARDING_STEPS.SITE_TITLE ]: <JetpackOnboardingSiteTitleStep />,
	[ JETPACK_ONBOARDING_STEPS.SITE_TYPE ]: <JetpackOnboardingSiteTypeStep />,
	[ JETPACK_ONBOARDING_STEPS.HOMEPAGE ]: <JetpackOnboardingHomepageStep />,
	[ JETPACK_ONBOARDING_STEPS.CONTACT_FORM ]: <JetpackOnboardingContactFormStep />,
	[ JETPACK_ONBOARDING_STEPS.BUSINESS_ADDRESS ]: <JetpackOnboardingBusinessAddressStep />,
	[ JETPACK_ONBOARDING_STEPS.WOOCOMMERCE ]: <JetpackOnboardingWoocommerceStep />,
	[ JETPACK_ONBOARDING_STEPS.STATS ]: <JetpackOnboardingStatsStep />,
	[ JETPACK_ONBOARDING_STEPS.SUMMARY ]: <JetpackOnboardingSummaryStep />,
};
