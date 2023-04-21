import { PLAN_ENTERPRISE_GRID_WPCOM } from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import MarketingMessage from 'calypso/components/marketing-message';
import Notice from 'calypso/components/notice';
import { getDiscountByName } from 'calypso/lib/discounts';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import {
	getSitePlanSlug,
	isCurrentUserCurrentPlanOwner,
} from 'calypso/state/sites/plans/selectors';
import { calculatePlanUpgradeCredits } from 'calypso/state/sites/plans/selectors/calculate-plan-upgrade-credits';
import { isCurrentPlanPaid, isJetpackSite } from 'calypso/state/sites/selectors';

function usePlanUpgradeCreditsDisplay(
	siteId: number,
	visiblePlanNames: string[] = []
): {
	creditsValue: number;
	isPlanUpgradeCreditEligible: boolean;
} {
	const isSiteOnPaidPlan = !! useSelector( ( state ) => isCurrentPlanPaid( state, siteId ) );
	const currentSitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) );
	const creditsValue = useSelector( ( state ) =>
		calculatePlanUpgradeCredits( state, siteId, visiblePlanNames )
	);
	const isNotJetpackSiteOrIsAtomicSite = !! useSelector(
		( state ) => ! isJetpackSite( state, siteId ) || isSiteAutomatedTransfer( state, siteId )
	);

	const isHigherPlanAvailable = function () {
		const visiblePlansWithoutEnterprise = visiblePlanNames.filter(
			( planName ) => planName !== PLAN_ENTERPRISE_GRID_WPCOM
		);
		const highestPlanName = visiblePlansWithoutEnterprise.pop();
		return highestPlanName !== currentSitePlanSlug;
	};

	const isUpgradeEligibleSite =
		isSiteOnPaidPlan && isNotJetpackSiteOrIsAtomicSite && isHigherPlanAvailable();

	return {
		creditsValue,
		isPlanUpgradeCreditEligible: isUpgradeEligibleSite && creditsValue > 0,
	};
}

export default function PlanNotices( {
	siteId,
	isInSignup,
	visiblePlanNames = [],
	discountInformation: { withDiscount, discountEndDate },
}: {
	visiblePlanNames: string[];
	isInSignup: boolean;
	siteId: number;
	discountInformation: {
		withDiscount: string;
		discountEndDate: Date;
	};
} ) {
	const translate = useTranslate();
	const [ isNoticeDismissed, setIsNoticeDismissed ] = useState( false );
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const canUserPurchasePlan = useSelector(
		( state ) =>
			! isCurrentPlanPaid( state, siteId ) || isCurrentUserCurrentPlanOwner( state, siteId )
	);
	const activeDiscount = getDiscountByName( withDiscount, discountEndDate );
	const { creditsValue, isPlanUpgradeCreditEligible } = usePlanUpgradeCreditsDisplay(
		siteId,
		visiblePlanNames
	);

	if ( isNoticeDismissed ) {
		return null;
	} else if ( ! canUserPurchasePlan ) {
		return (
			<Notice
				className="plan-features__notice"
				showDismiss={ true }
				onDismissClick={ () => setIsNoticeDismissed( true ) }
				status="is-info"
			>
				{ translate(
					'This plan was purchased by a different WordPress.com account. To manage this plan, log in to that account or contact the account owner.'
				) }
			</Notice>
		);
	} else if ( activeDiscount ) {
		return (
			<Notice
				className="plan-features__notice-credits"
				showDismiss={ true }
				onDismissClick={ () => setIsNoticeDismissed( true ) }
				icon="info-outline"
				status="is-success"
			>
				{ activeDiscount?.plansPageNoticeTextTitle && (
					<strong>
						{ activeDiscount?.plansPageNoticeTextTitle }
						<br />
					</strong>
				) }
				{ activeDiscount.plansPageNoticeText }
			</Notice>
		);
	} else if ( isPlanUpgradeCreditEligible && ! isInSignup ) {
		return (
			<Notice
				className="plan-features__notice-credits"
				showDismiss={ true }
				onDismissClick={ () => setIsNoticeDismissed( true ) }
				icon="info-outline"
				status="is-success"
			>
				{ translate(
					'You have {{b}}%(amountInCurrency)s{{/b}} of pro-rated credits available from your current plan. ' +
						'Apply those credits towards an upgrade before they expire!',
					{
						args: {
							amountInCurrency: formatCurrency( creditsValue, currencyCode ?? '' ),
						},
						components: {
							b: <strong />,
						},
					}
				) }
			</Notice>
		);
	}
	return <MarketingMessage siteId={ siteId } />;
}
