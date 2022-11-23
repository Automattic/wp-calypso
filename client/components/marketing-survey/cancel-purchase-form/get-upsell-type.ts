import {
	isWpComMonthlyPlan,
	isWpComBusinessPlan,
	isWpComPremiumPlan,
	isWpComAnnualPlan,
	isWpComBiennialPlan,
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
	| 'upgrade-atomic';

/**
 * Get a relevant upsell nudge for the chosen reason if exists.
 *
 * @param {string} reason The chosen reason for cancellation
 * @param {UpsellOptions} opts The options for the upsell nudge
 * @returns {UpsellType} The upsell nudge type
 */
export function getUpsellType( reason: string, opts: UpsellOptions ): UpsellType {
	const { productSlug, canRefund, canDowngrade, canOfferFreeMonth } = opts;

	if ( ! productSlug ) {
		return '';
	}

	switch ( reason ) {
		case 'tooExpensive':
		case 'wantCheaperPlan':
			if ( ! canDowngrade ) {
				return '';
			}

			if (
				canRefund &&
				( isWpComAnnualPlan( productSlug ) || isWpComBiennialPlan( productSlug ) )
			) {
				return 'downgrade-monthly';
			}

			if ( isWpComPremiumPlan( productSlug ) && isWpComMonthlyPlan( productSlug ) ) {
				return 'downgrade-personal';
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
			return 'live-chat:plugins';

		case 'cannotFindWhatIWanted':
		case 'otherFeatures':
			return 'live-chat:plans';

		case 'cannotUsePlugin':
		case 'cannotUseTheme':
			if ( isWpComBusinessPlan( productSlug ) || isWpComEcommercePlan( productSlug ) ) {
				return reason === 'cannotUsePlugin' ? 'live-chat:plugins' : 'live-chat:themes';
			}
			return 'upgrade-atomic';

		case 'didNotGetFreeDomain':
		case 'otherDomainIssues':
		case 'domainConnection':
			return 'live-chat:domains';
	}

	return '';
}
