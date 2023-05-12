import { PlanSlug } from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import MarketingMessage from 'calypso/components/marketing-message';
import Notice from 'calypso/components/notice';
import { getDiscountByName } from 'calypso/lib/discounts';
import { useCalculateMaxPlanUpgradeCredit } from 'calypso/my-sites/plan-features-2023-grid/hooks/use-calculate-max-plan-upgrade-credit';
import { useIsPlanUpgradeCreditVisible } from 'calypso/my-sites/plan-features-2023-grid/hooks/use-is-plan-upgrade-credit-visible';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors';
import { isCurrentPlanPaid } from 'calypso/state/sites/selectors';

export default function PlanNotice( {
	siteId,
	isInSignup,
	visiblePlans = [],
	discountInformation: { withDiscount, discountEndDate },
}: {
	visiblePlans: PlanSlug[];
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
	const creditsValue = useCalculateMaxPlanUpgradeCredit( siteId, visiblePlans );
	const isPlanUpgradeCreditEligible = useIsPlanUpgradeCreditVisible( siteId, visiblePlans );

	const handleDismissNotice = () => setIsNoticeDismissed( true );

	if ( isNoticeDismissed || isInSignup ) {
		return null;
	} else if ( ! canUserPurchasePlan ) {
		return (
			<Notice
				className="plan-features-main__notice"
				showDismiss={ true }
				onDismissClick={ handleDismissNotice }
				icon="info-outline"
				status="is-success"
				isReskinned={ true }
			>
				{ translate(
					'This plan was purchased by a different WordPress.com account. To manage this plan, log in to that account or contact the account owner.'
				) }
			</Notice>
		);
	} else if ( activeDiscount ) {
		return (
			<Notice
				className="plan-features-main__notice"
				showDismiss={ true }
				onDismissClick={ handleDismissNotice }
				icon="info-outline"
				status="is-success"
				isReskinned={ true }
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
	} else if ( isPlanUpgradeCreditEligible ) {
		return (
			<Notice
				className="plan-features-main__notice"
				showDismiss={ true }
				onDismissClick={ handleDismissNotice }
				icon="info-outline"
				status="is-success"
				isReskinned={ true }
			>
				{ translate(
					'We’ve applied the {{b}}%(amountInCurrency)s{{/b}} {{a}}upgrade credit{{/a}} from your current plan as a deduction to your new plan, below. This remaining credit will be applied at checkout if you upgrade today!',
					{
						args: {
							amountInCurrency: formatCurrency( creditsValue, currencyCode ?? '' ),
						},
						components: {
							b: <strong />,
							a: (
								<a
									href={ localizeUrl(
										'https://wordpress.com/support/manage-purchases/#pro-rated-credits'
									) }
									className="get-apps__desktop-link"
								/>
							),
						},
					}
				) }
			</Notice>
		);
	}
	return <MarketingMessage siteId={ siteId } />;
}
