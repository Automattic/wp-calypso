import { PlanSlug } from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import MarketingMessage from 'calypso/components/marketing-message';
import Notice from 'calypso/components/notice';
import { getDiscountByName } from 'calypso/lib/discounts';
import { usePlanUpgradeCreditsDisplay } from 'calypso/my-sites/plans-features-main/hooks/use-plan-upgrade-credits-display';
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
	const { creditsValue, isPlanUpgradeCreditEligible } = usePlanUpgradeCreditsDisplay(
		siteId,
		visiblePlans
	);

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
