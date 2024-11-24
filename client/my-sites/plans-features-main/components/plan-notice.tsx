import { PlanSlug, isProPlan, isStarterPlan } from '@automattic/calypso-products';
import { Site, SiteMediaStorage } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useStorageText } from 'calypso/components/backup-storage-space/hooks';
import MarketingMessage from 'calypso/components/marketing-message';
import Notice from 'calypso/components/notice';
import { getDiscountByName } from 'calypso/lib/discounts';
import { ActiveDiscount } from 'calypso/lib/discounts/active-discounts';
import { usePlanUpgradeCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-plan-upgrade-credits-applicable';
import { useSelector } from 'calypso/state';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { getCurrentPlan, isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors';
import { getSitePlan, isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import PlanNoticeCreditUpgrade from './plan-notice-credit-update';

export type PlanNoticeProps = {
	siteId: number;
	visiblePlans: PlanSlug[];
	isInSignup?: boolean;
	showLegacyStorageFeature?: boolean;
	mediaStorage?: SiteMediaStorage;
	discountInformation?: {
		coupon: string;
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
const PLAN_LEGACY_STORAGE_NOTICE = 'plan-legacy-storage-notice';

export type PlanNoticeTypes =
	| typeof NO_NOTICE
	| typeof USER_CANNOT_PURCHASE_NOTICE
	| typeof ACTIVE_DISCOUNT_NOTICE
	| typeof PLAN_UPGRADE_CREDIT_NOTICE
	| typeof MARKETING_NOTICE
	| typeof PLAN_RETIREMENT_NOTICE
	| typeof CURRENT_PLAN_IN_APP_PURCHASE_NOTICE
	| typeof PLAN_LEGACY_STORAGE_NOTICE;

function useResolveNoticeType(
	{
		showLegacyStorageFeature,
		siteId,
		isInSignup,
		visiblePlans = [],
		discountInformation,
	}: PlanNoticeProps,
	isNoticeDismissed: boolean
): PlanNoticeTypes {
	const canUserPurchasePlan = useSelector(
		( state ) =>
			! isCurrentPlanPaid( state, siteId ) || isCurrentUserCurrentPlanOwner( state, siteId )
	);
	const activeDiscount =
		discountInformation &&
		getDiscountByName( discountInformation.coupon, discountInformation.discountEndDate );
	const planUpgradeCreditsApplicable = usePlanUpgradeCreditsApplicable( siteId, visiblePlans );
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
	} else if ( showLegacyStorageFeature ) {
		return PLAN_LEGACY_STORAGE_NOTICE;
	} else if ( activeDiscount ) {
		return ACTIVE_DISCOUNT_NOTICE;
	} else if ( planUpgradeCreditsApplicable ) {
		return PLAN_UPGRADE_CREDIT_NOTICE;
	}
	return MARKETING_NOTICE;
}

export default function PlanNotice( props: PlanNoticeProps ) {
	const { siteId, visiblePlans, discountInformation } = props;
	const translate = useTranslate();
	const [ isNoticeDismissed, setIsNoticeDismissed ] = useState( false );
	const noticeType = useResolveNoticeType( props, isNoticeDismissed );
	const { data: mediaStorage } = Site.useSiteMediaStorage( { siteIdOrSlug: siteId } );
	const usedGigabytes = useStorageText( mediaStorage?.storageUsedBytes ?? 0 );
	const handleDismissNotice = () => setIsNoticeDismissed( true );
	let activeDiscount =
		discountInformation &&
		getDiscountByName( discountInformation.coupon, discountInformation.discountEndDate );

	switch ( noticeType ) {
		case NO_NOTICE:
			return null;
		case USER_CANNOT_PURCHASE_NOTICE:
			return (
				<Notice
					className="plan-features-main__notice"
					showDismiss
					onDismissClick={ handleDismissNotice }
					icon="info-outline"
					status="is-success"
					isReskinned
				>
					{ translate(
						'This plan was purchased by a different WordPress.com account. To manage this plan, log in to that account or contact the account owner.'
					) }
				</Notice>
			);
		case PLAN_LEGACY_STORAGE_NOTICE:
			return (
				<Notice
					className="plan-features-main__notice"
					showDismiss
					onDismissClick={ handleDismissNotice }
					icon="info-outline"
					status="is-warning"
					isReskinned
				>
					{ translate(
						'Your plan currently has a legacy feature that provides 200GB of space. ' +
							'You are currently using {{b}}%(usedGigabytes)s{{/b}} of space. ' +
							'Switching to a different plan or billing interval will lower the amount of available storage to 50GB. ' +
							'Please keep in mind that the change will be irreversible.',
						{
							args: {
								usedGigabytes: usedGigabytes ?? '',
							},
							components: {
								b: <strong />,
							},
						}
					) }
				</Notice>
			);
		case ACTIVE_DISCOUNT_NOTICE:
			activeDiscount = activeDiscount as ActiveDiscount;
			return (
				<Notice
					className="plan-features-main__notice"
					showDismiss
					onDismissClick={ handleDismissNotice }
					icon="info-outline"
					status="is-success"
					isReskinned
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
				<PlanNoticeCreditUpgrade
					className="plan-features-main__notice"
					onDismissClick={ handleDismissNotice }
					siteId={ siteId }
					visiblePlans={ visiblePlans }
				/>
			);
		case PLAN_RETIREMENT_NOTICE:
			return (
				<Notice
					className="plan-features-main__notice"
					showDismiss={ false }
					isReskinned
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
					isReskinned
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
