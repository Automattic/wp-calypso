/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { OFFER_RESET_SUPPORT_PAGE, PLAN_RENEWAL_RECOMMENDATION } from '../constants';
import { isEligibleForRenewalAtOldRate } from '../utils';
import ExternalLink from 'components/external-link';
import { getPlan, getYearlyPlanByMonthly } from 'lib/plans';
import { isMonthly } from 'lib/plans/constants';
import { isJetpackPlanSlug, getJetpackProductDisplayNameBySlug } from 'lib/products-values';

/**
 * Type dependencies
 */

import type { Purchase } from 'lib/purchases/types';

type Props = {
	purchase: Purchase;
};

const PlanRenewalNotice: FunctionComponent< Props > = ( { purchase } ) => {
	const translate = useTranslate();

	let notice;

	if ( isEligibleForRenewalAtOldRate( purchase ) ) {
		notice = translate(
			"We're updating our plans to include new features and improved functionality. " +
				'As a thank you for being a loyal Jetpack subscriber, you can renew your current plan one time – your choice, for one month or one year. ' +
				'After that, you will have to move to a new plan.'
		);
	} else {
		notice = translate(
			"We're sorry, your current plan is no longer available. Please select a new option."
		);

		const { productSlug: currentSlug } = purchase;
		const recommendedSlug =
			PLAN_RENEWAL_RECOMMENDATION[
				isMonthly( currentSlug ) ? getYearlyPlanByMonthly( currentSlug ) : currentSlug
			];

		if ( recommendedSlug ) {
			notice = (
				<>
					{ notice }&nbsp;
					{ translate(
						'Based on your usage of the %(currentPlan)s plan, we recommend {{recommendedPlan/}}.',
						{
							comment:
								'`currentPlan` refers to the current deprecated plan. `recommendedPlan` is the plan we recommend instead.',
							args: {
								currentPlan: getPlan( purchase.productSlug ).getTitle(),
							},
							components: {
								recommendedPlan: isJetpackPlanSlug( recommendedSlug )
									? getPlan( recommendedSlug ).getTitle()
									: getJetpackProductDisplayNameBySlug( recommendedSlug ),
							},
						}
					) }
				</>
			);
		}
	}

	return (
		<>
			{ notice }&nbsp;
			<ExternalLink icon href={ OFFER_RESET_SUPPORT_PAGE }>
				{ translate( 'More info' ) }
			</ExternalLink>
		</>
	);
};

export default PlanRenewalNotice;
