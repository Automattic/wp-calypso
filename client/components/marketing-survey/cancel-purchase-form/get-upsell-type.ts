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
		case 'wantCheaperPlan':
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

		case 'noTime':
		case 'siteIsNotReady':
			if ( isWpComMonthlyPlan( productSlug ) && canOfferFreeMonth ) {
				return 'free-month-offer';
			}
			return 'built-by';

		case 'needProfessionalHelp':
		case 'tooComplicated':
		case 'customization':
			return 'built-by';

		case 'eCommerceFeatures':
			return liveChatSupported ? 'live-chat:plugins' : '';

		case 'cannotFindWhatIWanted':
		case 'otherFeatures':
			return liveChatSupported ? 'live-chat:plans' : '';

		case 'cannotUsePlugin':
		case 'cannotUseTheme':
			if ( isWpComBusinessPlan( productSlug ) || isWpComEcommercePlan( productSlug ) ) {
				if ( liveChatSupported ) {
					return reason === 'cannotUsePlugin' ? 'live-chat:plugins' : 'live-chat:themes';
				}
				return '';
			}
			return 'upgrade-atomic';
		case 'seoIssues':
			return 'education:seo';
		case 'loadingTime':
			return 'education:loading-time';
		case 'didNotGetFreeDomain':
			return 'education:free-domain';
		case 'domainConnection':
			return 'education:domain-connection';
		case 'otherDomainIssues':
			return liveChatSupported ? 'live-chat:domains' : '';
	}

	return '';
}
