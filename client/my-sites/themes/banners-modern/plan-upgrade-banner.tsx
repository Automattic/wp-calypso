import { Button } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

const CheckCircleIcon = () => (
	<svg
		className="plan-upgrade-banner__check-icon"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<circle cx="12" cy="12" r="12" fill="currentColor" />
		<path
			d="M7.5 12.5l3 3 6-6"
			stroke="white"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

interface PlanUpgradeBannerProps {
	variant?: 'light' | 'dark';
}

const PlanUpgradeBanner = ( { variant = 'light' }: PlanUpgradeBannerProps ) => {
	const translate = useTranslate();
	const instanceId = useInstanceId( PlanUpgradeBanner );
	const [ billingPeriod, setBillingPeriod ] = useState< 'monthly' | 'annually' >( 'monthly' );

	const trackClick = useCallback( () => {
		recordTracksEvent( 'calypso_themeshowcase_plan_upgrade_banner_click' );
	}, [] );

	const features = [
		translate( 'Free domain for one year' ),
		translate( 'Install plugins & themes' ),
		translate( 'Real-time backups' ),
	];

	const price = billingPeriod === 'monthly' ? 38 : 30;

	return (
		<div
			className={ clsx( 'banner-modern plan-upgrade-banner', { 'is-dark': variant === 'dark' } ) }
		>
			<div className="plan-upgrade-banner__plan">
				<h2 className="plan-upgrade-banner__title">{ translate( 'Business plan' ) }</h2>
				<p className="plan-upgrade-banner__description">
					{ preventWidows(
						translate(
							'Instantly unlock thousands of different themes and install your own when you choose the Business plan.'
						)
					) }
				</p>
			</div>
			<div className="plan-upgrade-banner__features">
				<h3 className="plan-upgrade-banner__features-heading">
					{ translate( "What's included" ) }
				</h3>
				<ul className="plan-upgrade-banner__features-list">
					{ features.map( ( feature, index ) => (
						<li key={ index } className="plan-upgrade-banner__features-item">
							<CheckCircleIcon />
							<span>{ feature }</span>
						</li>
					) ) }
				</ul>
			</div>
			<div className="plan-upgrade-banner__pricing">
				<div className="plan-upgrade-banner__price">
					<span className="plan-upgrade-banner__price-currency">$</span>
					<span className="plan-upgrade-banner__price-amount">{ price }</span>
					<span className="plan-upgrade-banner__price-period">{ translate( '/month' ) }</span>
				</div>
				<fieldset className="plan-upgrade-banner__billing-toggle">
					<label className="plan-upgrade-banner__billing-option">
						<input
							type="radio"
							name={ `plan-upgrade-billing-${ instanceId }` }
							checked={ billingPeriod === 'monthly' }
							onChange={ () => setBillingPeriod( 'monthly' ) }
						/>
						<span>{ translate( 'Monthly' ) }</span>
					</label>
					<label className="plan-upgrade-banner__billing-option">
						<input
							type="radio"
							name={ `plan-upgrade-billing-${ instanceId }` }
							checked={ billingPeriod === 'annually' }
							onChange={ () => setBillingPeriod( 'annually' ) }
						/>
						<span>{ translate( 'Annually' ) }</span>
						<span className="plan-upgrade-banner__billing-savings">
							{ translate( '(save %(percent)s%%)', { args: { percent: 37 } } ) }
						</span>
					</label>
				</fieldset>
				<Button
					className="plan-upgrade-banner__cta"
					variant="primary"
					href="/plans"
					onClick={ trackClick }
				>
					{ translate( 'Get Business' ) }
				</Button>
			</div>
		</div>
	);
};

export default PlanUpgradeBanner;
