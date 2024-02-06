import {
	FEATURE_CUSTOM_DOMAIN,
	isWooExpressPlan,
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { GridPlan } from '../../types';
import { PlanFeaturesItem } from '../item';

type MobileFreeDomainProps = {
	gridPlan: GridPlan;
	paidDomainName?: string;
};

const MobileFreeDomain = ( {
	gridPlan: { planSlug, isMonthlyPlan, features },
	paidDomainName,
}: MobileFreeDomainProps ) => {
	const translate = useTranslate();

	if ( isMonthlyPlan || isWpComFreePlan( planSlug ) || isWpcomEnterpriseGridPlan( planSlug ) ) {
		return null;
	}

	// Remove the custom domain feature for Woo Express plans with introductory offer.
	if (
		isWooExpressPlan( planSlug ) &&
		! features.wpcomFeatures.some( ( feature ) => feature.getSlug() === FEATURE_CUSTOM_DOMAIN )
	) {
		return null;
	}

	const displayText = paidDomainName
		? translate( '%(paidDomainName)s is included', {
				args: { paidDomainName },
		  } )
		: translate( 'Free domain for one year' );

	return (
		<div className="plan-features-2023-grid__highlighted-feature">
			<PlanFeaturesItem>
				<span className="plan-features-2023-grid__item-info is-annual-plan-feature is-available">
					<span className="plan-features-2023-grid__item-title is-bold">{ displayText }</span>
				</span>
			</PlanFeaturesItem>
		</div>
	);
};

export default MobileFreeDomain;
