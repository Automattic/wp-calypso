import {
	isFreePlan,
	isPersonalPlan,
	isPremiumPlan,
	PLAN_BUSINESS,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	WPCOM_FEATURES_PARTNER_THEMES,
	WPCOM_FEATURES_PREMIUM_THEMES_LIMITED,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Banner from 'calypso/components/banner';
import { getSitePlanSlug } from 'calypso/state/sites/plans/selectors';
import type { IAppState } from 'calypso/state/types';

interface Props {
	siteId: number;
	siteSlug?: string | null;
}

const PlanUpgradeNudge = ( { siteId, siteSlug }: Props ) => {
	const translate = useTranslate();
	const planSlug = useSelector( ( state: IAppState ) => getSitePlanSlug( state, siteId ) ?? '' );

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

	if ( isFreePlan( planSlug ) ) {
		return (
			<Banner
				callToAction={ translate( 'Upgrade to Personal' ) }
				description={ translate(
					'Get access to a selection of premium themes with a Personal plan.'
				) }
				event="calypso_themeshowcase_personal_upgrade_nudge"
				feature={ WPCOM_FEATURES_PREMIUM_THEMES_LIMITED }
				href={ `/checkout/${ siteSlug }/personal` }
				icon={ nudgeIcon }
				plan={ PLAN_PERSONAL }
				secondaryCallToAction={ translate( 'View plans' ) }
				secondaryEvent="calypso_themeshowcase_personal_upgrade_nudge_view_plans"
				secondaryHref={ `/plans/${ siteSlug }?intent=plans-themes` }
				title={ translate( 'Unlock more themes' ) }
			/>
		);
	}

	if ( isPersonalPlan( planSlug ) ) {
		return (
			<Banner
				callToAction={ translate( 'Upgrade to Premium' ) }
				description={ translate( 'Get access to hundreds of premium themes.' ) }
				event="calypso_themeshowcase_premium_upgrade_nudge"
				feature={ WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED }
				href={ `/checkout/${ siteSlug }/premium` }
				icon={ nudgeIcon }
				plan={ PLAN_PREMIUM }
				secondaryCallToAction={ translate( 'View plans' ) }
				secondaryEvent="calypso_themeshowcase_premium_upgrade_nudge_view_plans"
				secondaryHref={ `/plans/${ siteSlug }?intent=plans-themes` }
				title={ translate( 'Unlock all premium themes' ) }
			/>
		);
	}

	if ( isPremiumPlan( planSlug ) ) {
		return (
			<Banner
				callToAction={ translate( 'Upgrade to Business' ) }
				description={ translate(
					'Get exclusive themes from top theme builders with our partner theme collection.'
				) }
				event="calypso_themeshowcase_business_upgrade_nudge"
				feature={ WPCOM_FEATURES_PARTNER_THEMES }
				href={ `/checkout/${ siteSlug }/business` }
				icon={ nudgeIcon }
				plan={ PLAN_BUSINESS }
				secondaryCallToAction={ translate( 'View plans' ) }
				secondaryEvent="calypso_themeshowcase_business_upgrade_nudge_view_plans"
				secondaryHref={ `/plans/${ siteSlug }?intent=plans-themes` }
				title={ translate( 'Unlock partner themes' ) }
			/>
		);
	}

	return null;
};

export default PlanUpgradeNudge;
