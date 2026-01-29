import {
	FEATURE_CUSTOM_DOMAIN,
	isWooExpressPlan,
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
} from '@automattic/calypso-products';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../grid-context';
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
	const { isVar1dVariant, isVar4Variant, isExperimentVariant } = usePlansGridContext();

	// For var1d, don't render the highlighted free domain - it appears in regular feature list
	if ( isVar1dVariant ) {
		return null;
	}

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

	// Apply green styling for experiment variants (which use "Everything in X, plus:" features)
	// but not for var1d, var4, or control experience
	const shouldHighlightDomain = isExperimentVariant && ! isVar4Variant && paidDomainName;

	const titleClasses = clsx( 'plan-features-2023-grid__item-title', 'is-bold', {
		'is-domain-included-highlight': shouldHighlightDomain,
	} );

	return (
		<div className="plan-features-2023-grid__highlighted-feature">
			<PlanFeaturesItem>
				<span className="plan-features-2023-grid__item-info is-annual-plan-feature is-available">
					<span className={ titleClasses }>{ displayText }</span>
				</span>
			</PlanFeaturesItem>
		</div>
	);
};

export default MobileFreeDomain;
