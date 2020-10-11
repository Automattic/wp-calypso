/**
 * External dependencies
 */
import * as Plans from '../plans';
import { translate } from 'i18n-calypso';
import type { FeatureId, Feature } from './types';
/**
 * Internal dependencies
 */
const { PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE } = Plans;

export const featuresList: Record< FeatureId, Feature > = {
	domain: {
		id: 'domain',
		name: translate( 'Custom domains' ) as string,
		description: translate(
			'Help your site stand out. The first year is free with a plan.'
		) as string,
		minSupportedPlan: PLAN_PERSONAL,
	},
	store: {
		id: 'store',
		name: translate( 'Store' ) as string,
		description: translate(
			'Sell unlimited products or services with a powerful, flexible online store.'
		) as string,
		minSupportedPlan: PLAN_ECOMMERCE,
	},
	seo: {
		id: 'seo',
		name: translate( 'SEO tools' ) as string,
		description: translate( 'Boost your SEO and connect a Google Analytics account.' ) as string,
		minSupportedPlan: PLAN_BUSINESS,
	},
	plugins: {
		id: 'plugins',
		name: translate( 'Plugins' ) as string,
		description: translate( 'Install plugins to extend the power of your site.' ) as string,
		minSupportedPlan: PLAN_BUSINESS,
	},
	'ad-free': {
		id: 'ad-free',
		name: translate( 'Ad-free' ) as string,
		description: translate( 'Remove advertisements and own your brand.' ) as string,
		minSupportedPlan: PLAN_PERSONAL,
	},
	'image-storage': {
		id: 'image-storage',
		name: translate( 'Image storage' ) as string,
		description: translate( 'Extended storage space for hi-res images.' ) as string,
		minSupportedPlan: PLAN_PREMIUM,
	},
	'video-storage': {
		id: 'video-storage',
		name: translate( 'Video storage' ) as string,
		description: translate( 'Host your own ad-free videos' ) as string,
		minSupportedPlan: PLAN_PREMIUM,
	},
	support: {
		id: 'support',
		name: translate( 'Priority support' ) as string,
		description: translate( 'Chat with an expert live.' ) as string,
		minSupportedPlan: PLAN_BUSINESS,
	},
};
