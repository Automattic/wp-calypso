import {
	isFreePlan,
	isPersonalPlan,
	isPremiumPlan,
	PLAN_BUSINESS,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
import { brush } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { cloneElement } from 'react';
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

	const nudgeIcon = cloneElement( brush, { fill: 'currentColor' } );

	if ( isFreePlan( planSlug ) ) {
		return (
			<Banner
				callToAction={ translate( 'Upgrade to Personal' ) }
				description={ translate( 'Get access to a selection of premium themes.' ) }
				event="calypso_themeshowcase_personal_upgrade_nudge"
				href={ `/checkout/${ siteSlug }/personal` }
				icon={ nudgeIcon }
				plan={ PLAN_PERSONAL }
				title={ translate( 'Unlock premium themes' ) }
			/>
		);
	}

	if ( isPersonalPlan( planSlug ) ) {
		return (
			<Banner
				callToAction={ translate( 'Upgrade to Premium' ) }
				description={ translate( 'Get access to hundreds of premium themes.' ) }
				event="calypso_themeshowcase_premium_upgrade_nudge"
				href={ `/checkout/${ siteSlug }/premium` }
				icon={ nudgeIcon }
				plan={ PLAN_PREMIUM }
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
				href={ `/checkout/${ siteSlug }/business` }
				icon={ nudgeIcon }
				plan={ PLAN_BUSINESS }
				title={ translate( 'Unlock partner themes' ) }
			/>
		);
	}

	return null;
};

export default PlanUpgradeNudge;
