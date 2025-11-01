import {
	BusinessPlans,
	DotcomPlans,
	EcommercePlans,
	SubscriptionBillPeriod,
} from '@automattic/api-core';
import config from '@automattic/calypso-config';
import type { Purchase } from '@automattic/api-core';

type UpsellOptions = {
	canDowngrade: boolean;
	canOfferFreeMonth: boolean;
};

type UpsellType =
	| ''
	| 'downgrade-monthly'
	| 'downgrade-personal'
	| 'free-month-offer'
	| 'built-by'
	| 'live-chat:plans'
	| 'live-chat:plugins'
	| 'live-chat:themes'
	| 'live-chat:domains'
	| 'education:loading-time'
	| 'education:seo'
	| 'education:free-domain'
	| 'education:domain-connection'
	| 'upgrade-atomic';

/**
 * Get a relevant upsell nudge for the chosen reason if exists.
 */
export function getUpsellType(
	reason: string,
	purchase: Purchase,
	opts: UpsellOptions
): UpsellType {
	const { canDowngrade, canOfferFreeMonth } = opts;
	const liveChatSupported = config.isEnabled( 'livechat_solution' );
	const productSlug = purchase.product_slug;

	switch ( reason ) {
		case 'tooExpensive':
		case 'budgetConstraints':
			if ( ! canDowngrade ) {
				return '';
			}

			if ( productSlug === DotcomPlans.PREMIUM ) {
				return 'downgrade-personal';
			}

			if (
				purchase.bill_period_days === SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD ||
				purchase.bill_period_days === SubscriptionBillPeriod.PLAN_BIENNIAL_PERIOD ||
				purchase.bill_period_days === SubscriptionBillPeriod.PLAN_TRIENNIAL_PERIOD
			) {
				return 'downgrade-monthly';
			}

			break;

		case 'freeIsGoodEnough':
		case 'foundBetterValue':
		case 'tooMuchTimeToLearn':
		case 'inadequateOnboarding':
			if (
				purchase.bill_period_days === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD &&
				canOfferFreeMonth
			) {
				return 'free-month-offer';
			}
			return 'built-by';

		case 'limitedCustomization':
		case 'lackOfCustomization':
		case 'customization':
			return 'built-by';

		case 'missingFunctionality':
		case 'coreFeaturesMissing':
		case 'otherMissingFeatures':
			return liveChatSupported ? 'live-chat:plans' : '';

		case 'cannotInstallPlugins':
		case 'cannotUploadThemes': {
			if (
				( BusinessPlans as readonly string[] ).includes( productSlug ) ||
				( EcommercePlans as readonly string[] ).includes( productSlug )
			) {
				if ( liveChatSupported ) {
					return reason === 'cannotInstallPlugins' ? 'live-chat:plugins' : 'live-chat:themes';
				}
				return '';
			}
			return 'upgrade-atomic';
		}
		case 'tooSlow':
		case 'downtime':
			return 'education:loading-time';
		case 'troubleConnectingOrTransferring':
			return 'education:domain-connection';
		case 'otherDomain':
			return liveChatSupported ? 'live-chat:domains' : '';
	}

	return '';
}
