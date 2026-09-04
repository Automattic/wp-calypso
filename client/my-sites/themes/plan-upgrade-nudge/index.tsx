import {
	isFreePlan,
	isPersonalPlan,
	isPremiumPlan,
	PLAN_BUSINESS,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Banner from 'calypso/components/banner';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import type { IAppState } from 'calypso/state/types';

interface Props {
	siteId: number;
	siteSlug?: string | null;
}

const PlanUpgradeNudge = ( { siteId, siteSlug }: Props ) => {
	const translate = useTranslate();
	const planSlug = useSelector(
		( state: IAppState ) => getSitePlan( state, siteId )?.product_slug ?? ''
	);

	if ( ! siteSlug || ! planSlug ) {
		return null;
	}

	const nudgeIcon = (
		<span
			className="dashicons-before dashicons-admin-appearance"
			aria-hidden
			style={ { display: 'flex', alignItems: 'center', lineHeight: 1 } }
		/>
	);

	const viewPlansHref = `/plans/${ siteSlug }?intent=plans-themes`;

	if ( isFreePlan( planSlug ) ) {
		return (
			<Banner
				callToAction={ translate( 'Upgrade to Personal' ) }
				description={ translate(
					'Get access to a selection of premium themes with a Personal plan.'
				) }
				dismissPreferenceName="theme-showcase-personal-upgrade-nudge"
				horizontal
				event="calypso_themeshowcase_personal_upgrade_nudge"
				href={ `/checkout/${ siteSlug }/${ PLAN_PERSONAL }` }
				icon={ nudgeIcon }
				plan={ PLAN_PERSONAL }
				secondaryCallToAction={ translate( 'View plans' ) }
				secondaryEvent="calypso_themeshowcase_personal_upgrade_nudge_view_plans"
				secondaryHref={ viewPlansHref }
				title={ translate( 'Unlock more themes' ) }
			/>
		);
	}

	if ( isPersonalPlan( planSlug ) ) {
		return (
			<Banner
				callToAction={ translate( 'Upgrade to Premium' ) }
				description={ translate( 'Get access to hundreds of premium themes.' ) }
				dismissPreferenceName="theme-showcase-premium-upgrade-nudge"
				horizontal
				event="calypso_themeshowcase_premium_upgrade_nudge"
				href={ `/checkout/${ siteSlug }/${ PLAN_PREMIUM }` }
				icon={ nudgeIcon }
				plan={ PLAN_PREMIUM }
				secondaryCallToAction={ translate( 'View plans' ) }
				secondaryEvent="calypso_themeshowcase_premium_upgrade_nudge_view_plans"
				secondaryHref={ viewPlansHref }
				title={ translate( 'Unlock all premium themes' ) }
			/>
		);
	}

	if ( isPremiumPlan( planSlug ) ) {
		return (
			<Banner
				callToAction={ translate( 'Upgrade to Business' ) }
				description={ translate(
					'Get access to premium themes from top theme builders with a Business plan.'
				) }
				dismissPreferenceName="theme-showcase-business-upgrade-nudge"
				horizontal
				event="calypso_themeshowcase_business_upgrade_nudge"
				href={ `/checkout/${ siteSlug }/${ PLAN_BUSINESS }` }
				icon={ nudgeIcon }
				plan={ PLAN_BUSINESS }
				secondaryCallToAction={ translate( 'View plans' ) }
				secondaryEvent="calypso_themeshowcase_business_upgrade_nudge_view_plans"
				secondaryHref={ viewPlansHref }
				title={ translate( 'Unlock partner themes' ) }
			/>
		);
	}

	return null;
};

export default PlanUpgradeNudge;
