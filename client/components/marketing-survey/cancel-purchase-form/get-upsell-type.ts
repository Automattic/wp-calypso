import config from '@automattic/calypso-config';
import {
	isWpComMonthlyPlan,
	isWpComBusinessPlan,
	isWpComPremiumPlan,
	isWpComAnnualPlan,
	isWpComBiennialPlan,
	isWpComTriennialPlan,
	isWpComEcommercePlan,
} from '@automattic/calypso-products';

type UpsellOptions = {
	productSlug: string;
	canRefund: boolean;
	canDowngrade: boolean;
	canOfferFreeMonth: boolean;
};

export type UpsellType =
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
 * @param {string} reason The chosen reason for cancellation
 * @param {UpsellOptions} opts The options for the upsell nudge
 * @returns {UpsellType} The upsell nudge type
 */
export function getUpsellType( reason: string, opts: UpsellOptions ): UpsellType {
	const { productSlug, canDowngrade, canOfferFreeMonth } = opts;
	const liveChatSupported = config.isEnabled( 'livechat_solution' );

	if ( ! productSlug ) {
		return '';
	}

	switch ( reason ) {
		case 'tooExpensive':
		case 'budgetConstraints':
			if ( ! canDowngrade ) {
				return '';
			}

			if ( isWpComPremiumPlan( productSlug ) && isWpComAnnualPlan( productSlug ) ) {
				return 'downgrade-personal';
			}

			if (
				isWpComAnnualPlan( productSlug ) ||
				isWpComBiennialPlan( productSlug ) ||
				isWpComTriennialPlan( productSlug )
			) {
				return 'downgrade-monthly';
			}

			break;

		case 'freeIsGoodEnough':
		case 'foundBetterValue':
		case 'tooMuchTimeToLearn':
		case 'inadequateOnboarding':
			if ( isWpComMonthlyPlan( productSlug ) && canOfferFreeMonth ) {
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
		case 'cannotUploadThemes':
			if ( isWpComBusinessPlan( productSlug ) || isWpComEcommercePlan( productSlug ) ) {
				if ( liveChatSupported ) {
					return reason === 'cannotInstallPlugins' ? 'live-chat:plugins' : 'live-chat:themes';
				}
				return '';
			}
			return 'upgrade-atomic';
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
