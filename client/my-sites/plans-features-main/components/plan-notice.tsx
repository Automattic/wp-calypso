import { PlanSlug, isProPlan, isStarterPlan } from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import MarketingMessage from 'calypso/components/marketing-message';
import Notice from 'calypso/components/notice';
import { getDiscountByName } from 'calypso/lib/discounts';
import { ActiveDiscount } from 'calypso/lib/discounts/active-discounts';
import { useCalculateMaxPlanUpgradeCredit } from 'calypso/my-sites/plans-grid/hooks/use-calculate-max-plan-upgrade-credit';
import { useIsPlanUpgradeCreditVisible } from 'calypso/my-sites/plans-grid/hooks/use-is-plan-upgrade-credit-visible';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { getCurrentPlan, isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors';
import { getSitePlan, isCurrentPlanPaid } from 'calypso/state/sites/selectors';

export type PlanNoticeProps = {
	siteId: number;
	visiblePlans: PlanSlug[];
	isInSignup?: boolean;
	discountInformation?: {
		withDiscount: string;
		discountEndDate: Date;
	};
};
const NO_NOTICE = 'no-notice';
const USER_CANNOT_PURCHASE_NOTICE = 'user-cannot-purchase-notice';
const ACTIVE_DISCOUNT_NOTICE = 'active-discount-notice';
const PLAN_UPGRADE_CREDIT_NOTICE = 'plan-upgrade-credit-notice';
const MARKETING_NOTICE = 'marketing-notice';
const PLAN_RETIREMENT_NOTICE = 'plan-retirement-notice';
const CURRENT_PLAN_IN_APP_PURCHASE_NOTICE = 'current-plan-in-app-purchase-notice';

export type PlanNoticeTypes =
	| typeof NO_NOTICE
	| typeof USER_CANNOT_PURCHASE_NOTICE
	| typeof ACTIVE_DISCOUNT_NOTICE
	| typeof PLAN_UPGRADE_CREDIT_NOTICE
	| typeof MARKETING_NOTICE
	| typeof PLAN_RETIREMENT_NOTICE
	| typeof CURRENT_PLAN_IN_APP_PURCHASE_NOTICE;

function useResolveNoticeType(
	{ siteId, isInSignup, visiblePlans = [], discountInformation }: PlanNoticeProps,
	isNoticeDismissed: boolean
): PlanNoticeTypes {
	const canUserPurchasePlan = useSelector(
		( state ) =>
			! isCurrentPlanPaid( state, siteId ) || isCurrentUserCurrentPlanOwner( state, siteId )
	);
	const activeDiscount =
		discountInformation &&
		getDiscountByName( discountInformation.withDiscount, discountInformation.discountEndDate );
	const isPlanUpgradeCreditEligible = useIsPlanUpgradeCreditVisible( siteId, visiblePlans );
	const sitePlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const sitePlanSlug = sitePlan?.product_slug ?? '';
	const isCurrentPlanRetired = isProPlan( sitePlanSlug ) || isStarterPlan( sitePlanSlug );
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, siteId ) );
	const currentPurchase = useSelector( ( state ) =>
		getByPurchaseId( state, currentPlan?.id ?? 0 )
	);

	if ( isNoticeDismissed || isInSignup ) {
		return NO_NOTICE;
	} else if ( ! canUserPurchasePlan ) {
		return USER_CANNOT_PURCHASE_NOTICE;
	} else if ( isCurrentPlanRetired ) {
		return PLAN_RETIREMENT_NOTICE;
	} else if ( currentPurchase?.isInAppPurchase ) {
		return CURRENT_PLAN_IN_APP_PURCHASE_NOTICE;
	} else if ( activeDiscount ) {
		return ACTIVE_DISCOUNT_NOTICE;
	} else if ( isPlanUpgradeCreditEligible ) {
		return PLAN_UPGRADE_CREDIT_NOTICE;
	}
	return MARKETING_NOTICE;
}

export default function PlanNotice( props: PlanNoticeProps ) {
	const { siteId, visiblePlans, discountInformation } = props;
	const translate = useTranslate();
	const [ isNoticeDismissed, setIsNoticeDismissed ] = useState( false );
	const noticeType = useResolveNoticeType( props, isNoticeDismissed );
	const handleDismissNotice = () => setIsNoticeDismissed( true );
	let activeDiscount =
		discountInformation &&
		getDiscountByName( discountInformation.withDiscount, discountInformation.discountEndDate );
	const creditsValue = useCalculateMaxPlanUpgradeCredit( { siteId, plans: visiblePlans } );
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );

	switch ( noticeType ) {
		case NO_NOTICE:
			return null;
		case USER_CANNOT_PURCHASE_NOTICE:
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
		case ACTIVE_DISCOUNT_NOTICE:
			activeDiscount = activeDiscount as ActiveDiscount;
			return (
				<Notice
					className="plan-features-main__notice"
					showDismiss={ true }
					onDismissClick={ handleDismissNotice }
					icon="info-outline"
					status="is-success"
					isReskinned={ true }
				>
					{ activeDiscount.plansPageNoticeTextTitle && (
						<strong>
							{ activeDiscount.plansPageNoticeTextTitle }
							<br />
						</strong>
					) }
					{ activeDiscount.plansPageNoticeText }
				</Notice>
			);
		case PLAN_UPGRADE_CREDIT_NOTICE:
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
											'https://wordpress.com/support/manage-purchases/upgrade-your-plan/#upgrade-credit'
										) }
										className="get-apps__desktop-link"
									/>
								),
							},
						}
					) }
				</Notice>
			);
		case PLAN_RETIREMENT_NOTICE:
			return (
				<Notice
					className="plan-features-main__notice"
					showDismiss={ false }
					isReskinned={ true }
					icon="info-outline"
					status="is-error"
					text={ translate(
						'Your current plan is no longer available for new subscriptions. ' +
							'You’re all set to continue with the plan for as long as you like. ' +
							'Alternatively, you can switch to any of our current plans by selecting it below. ' +
							'Please keep in mind that switching plans will be irreversible.'
					) }
				/>
			);
		case CURRENT_PLAN_IN_APP_PURCHASE_NOTICE:
			return (
				<Notice
					className="plan-features-main__notice"
					showDismiss={ false }
					isReskinned={ true }
					icon="info-outline"
					status="is-error"
					text={ translate(
						'Your current plan is an in-app purchase. You can upgrade to a different plan from within the WordPress app.'
					) }
				></Notice>
			);

		case MARKETING_NOTICE:
		default:
			return <MarketingMessage siteId={ siteId } />;
	}
}
