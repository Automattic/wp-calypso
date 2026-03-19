import {
	getFeatureByKey,
	getPlan,
	PLAN_PERSONAL,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PREMIUM,
	PLAN_PREMIUM_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
} from '@automattic/calypso-products';
import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import { getProductCost, getProductDisplayCost } from 'calypso/state/products-list/selectors';
import type { IAppState } from 'calypso/state/types';

import './style.scss';

interface PlanUpgradeBannerProps {
	planSlug: typeof PLAN_PERSONAL | typeof PLAN_PREMIUM | typeof PLAN_BUSINESS;
	variant?: 'light' | 'dark';
}

const monthlyPlansMap = {
	[ PLAN_PERSONAL ]: PLAN_PERSONAL_MONTHLY,
	[ PLAN_PREMIUM ]: PLAN_PREMIUM_MONTHLY,
	[ PLAN_BUSINESS ]: PLAN_BUSINESS_MONTHLY,
};

const PlanUpgradeBanner = ( { planSlug, variant = 'light' }: PlanUpgradeBannerProps ) => {
	const translate = useTranslate();
	const [ isMonthly, setIsMonthly ] = useState< boolean >( false );

	const plan = getPlan( planSlug );

	const monthlyPlanSlug = monthlyPlansMap[ planSlug ];
	const monthlyPlan = getPlan( monthlyPlanSlug );

	const costMonth = useSelector(
		( state: IAppState ) => getProductCost( state, monthlyPlanSlug ) || 0
	);
	const displayCostMonth = useSelector( ( state: IAppState ) =>
		getProductDisplayCost( state, monthlyPlanSlug )
	);
	const costYear = useSelector( ( state: IAppState ) => getProductCost( state, planSlug ) || 0 );
	const displayCostYear = useSelector( ( state: IAppState ) =>
		getProductDisplayCost( state, planSlug )
	);

	const costMonthAnnualized = costMonth * 12;
	const annualDiscount = Math.floor(
		( ( costYear - costMonthAnnualized ) / costMonthAnnualized ) * -100
	);

	const trackClick = useCallback( () => {
		recordTracksEvent( 'calypso_themeshowcase_plan_upgrade_banner_click', {
			plan: isMonthly ? monthlyPlanSlug : planSlug,
		} );
	}, [ isMonthly, monthlyPlanSlug, planSlug ] );

	if ( ! plan || ! monthlyPlan ) {
		return null;
	}

	const amount = isMonthly ? displayCostMonth : displayCostYear;
	const period = isMonthly ? translate( '/month' ) : translate( '/year' );
	// @ts-ignore - if plan or monthlyPlan are null, the component doesn't render
	const pathSlug = isMonthly ? monthlyPlan.getPathSlug() : plan.getPathSlug();

	// @ts-ignore - getSignupFeatures is not typed as existing on all plan types, but it is in practice
	const featureSlugs: string[] = plan.getSignupFeatures();
	const features = featureSlugs.map( getFeatureByKey ).filter( Boolean );

	return (
		<div
			className={ clsx( 'banner-modern plan-upgrade-banner', { 'is-dark': variant === 'dark' } ) }
		>
			<div className="plan-upgrade-banner__plan">
				<h2 className="banner-modern__title plan-upgrade-banner__title">
					{
						// translators: %(planName)s is the plan name - e.g. Business or Premium
						translate( '%(planName)s plan', { args: { planName: plan.getTitle() } } )
					}
				</h2>
				<p className="banner-modern__description plan-upgrade-banner__description">
					{
						// @ts-ignore - getPlanTagline is not typed as existing on all plan types, but it is in practice
						preventWidows( plan.getPlanTagline() )
					}
				</p>
			</div>
			<div className="plan-upgrade-banner__features">
				<h3 className="plan-upgrade-banner__features-heading">
					{ translate( 'What’s included' ) }
				</h3>
				<ul className="plan-upgrade-banner__features-list">
					{ features.map( ( feature, index ) => (
						<li key={ index } className="plan-upgrade-banner__features-item">
							<div className="plan-upgrade-banner__check-icon">
								<Icon icon={ check } size={ 18 } />
							</div>
							<span>{ feature.getTitle() }</span>
						</li>
					) ) }
				</ul>
			</div>
			<div className="plan-upgrade-banner__pricing">
				<div className="plan-upgrade-banner__price">
					<span className="plan-upgrade-banner__price-amount">{ amount }</span>
					<span className="plan-upgrade-banner__price-period">{ period }</span>
				</div>
				<fieldset className="plan-upgrade-banner__billing-toggle">
					<label className="plan-upgrade-banner__billing-option">
						<input type="radio" checked={ isMonthly } onChange={ () => setIsMonthly( true ) } />
						<span>{ translate( 'Monthly' ) }</span>
					</label>
					<label className="plan-upgrade-banner__billing-option">
						<input type="radio" checked={ ! isMonthly } onChange={ () => setIsMonthly( false ) } />
						<span>{ translate( 'Annually' ) }</span>
						<span className="plan-upgrade-banner__billing-savings">
							{ annualDiscount
								? translate( '(save %(percent)s%%)', { args: { percent: annualDiscount } } )
								: '' }
						</span>
					</label>
				</fieldset>
				<Button
					className="plan-upgrade-banner__cta"
					variant="primary"
					href={ `/start/${ pathSlug }/?ref=themes-lp` }
					onClick={ trackClick }
				>
					{
						// translators: %(planName)s is the plan name - e.g. Business or Premium
						translate( 'Get %(planName)s', { args: { planName: plan.getTitle() } } )
					}
				</Button>
			</div>
		</div>
	);
};

export default PlanUpgradeBanner;
