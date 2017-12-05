/**
 * Internal Dependencies
 */
import React from 'react';
import JetpackOnboardingBusinessAddressStep from './steps/business-address';
import JetpackOnboardingContactFormStep from './steps/contact-form';
import JetpackOnboardingHomepageStep from './steps/homepage';
import JetpackOnboardingSiteTitleStep from './steps/site-title';
import JetpackOnboardingSiteTypeStep from './steps/site-type';
import JetpackOnboardingSummaryStep from './steps/summary';
import JetpackOnboardingWoocommerceStep from './steps/woocommerce';

export const JETPACK_ONBOARDING_STEPS = {
	SITE_TITLE: 'site-title',
	SITE_TYPE: 'site-type',
	HOMEPAGE: 'homepage',
	CONTACT_FORM: 'contact-form',
	BUSINESS_ADDRESS: 'business-address',
	WOOCOMMERCE: 'woocommerce',
	SUMMARY: 'summary',
};

export const JETPACK_ONBOARDING_COMPONENTS = {
	[ JETPACK_ONBOARDING_STEPS.SITE_TITLE ]: <JetpackOnboardingSiteTitleStep />,
	[ JETPACK_ONBOARDING_STEPS.SITE_TYPE ]: <JetpackOnboardingSiteTypeStep />,
	[ JETPACK_ONBOARDING_STEPS.HOMEPAGE ]: <JetpackOnboardingHomepageStep />,
	[ JETPACK_ONBOARDING_STEPS.CONTACT_FORM ]: <JetpackOnboardingContactFormStep />,
	[ JETPACK_ONBOARDING_STEPS.BUSINESS_ADDRESS ]: <JetpackOnboardingBusinessAddressStep />,
	[ JETPACK_ONBOARDING_STEPS.WOOCOMMERCE ]: <JetpackOnboardingWoocommerceStep />,
	[ JETPACK_ONBOARDING_STEPS.SUMMARY ]: <JetpackOnboardingSummaryStep />,
};
