import { useViewportMatch } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import useDetectWindowBoundary from 'calypso/lib/detect-window-boundary';
import { preventWidows } from 'calypso/lib/formatting';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { INTRO_PRICING_DISCOUNT_PERCENTAGE } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { isConnectStore } from 'calypso/my-sites/plans/jetpack-plans/product-grid/utils';
import { getJetpackSaleCouponDiscountRatio } from 'calypso/state/marketing/selectors';
import './style.scss';
import guaranteeBadge from './14-day-badge.svg';
import rocket from './rocket.svg';

// since this amount is backed into the badge above we make it a const
const GUARANTEE_DAYS = 14;

const IntroPricingBanner: FunctionComponent = () => {
	const translate = useTranslate();
	const jetpackSaleDiscount = useSelector( getJetpackSaleCouponDiscountRatio );
	const isNotNarrow = useViewportMatch( 'medium', '>=' );

	const CALYPSO_MASTERBAR_HEIGHT = 47;
	const CLOUD_MASTERBAR_HEIGHT = 0;

	const windowBoundaryOffset = useMemo( () => {
		if ( isJetpackCloud() || isConnectStore() ) {
			return CLOUD_MASTERBAR_HEIGHT;
		}

		return CALYPSO_MASTERBAR_HEIGHT;
	}, [] );
	const [ barRef, hasCrossed ] = useDetectWindowBoundary( windowBoundaryOffset );

	const outerDivProps = barRef ? { ref: barRef as React.RefObject< HTMLDivElement > } : {};

	// jetpackSaleDiscount is a percent saved ( i.e. .2 ), INTRO_PRICING_DISCOUNT_PERCENTAGE
	// INTRO_PRICING_DISCOUNT_PERCENTAGE is a percent * 100 saved i.e. 50
	// We need to convert both to the total cost ( 1 - discount, 20% saved is 80% total cost, etc ), multiply them
	// then switch back to the percent saved
	const discountPercentage =
		100 - ( ( 100 - INTRO_PRICING_DISCOUNT_PERCENTAGE ) / 100 ) * ( 1 - jetpackSaleDiscount ) * 100;

	return (
		<>
			<div className="intro-pricing-banner__viewport-sentinel" { ...outerDivProps }></div>
			<div className={ hasCrossed ? 'intro-pricing-banner__sticky' : 'intro-pricing-banner' }>
				<div className="intro-pricing-banner__discount">
					<img
						src={ rocket }
						alt={ translate( 'Rocket representing %(percent)d%% sale', {
							args: { percent: discountPercentage },
							textOnly: true,
						} ) }
					/>
					<span>
						{ preventWidows(
							translate( 'Get %(percent)d%% off your first year.*', {
								args: {
									percent: discountPercentage,
								},
								comment: '* clause describing the price adjustment',
							} )
						) }
					</span>
				</div>
				{ isNotNarrow && (
					<div className="intro-pricing-banner__guarantee">
						<img
							src={ guaranteeBadge }
							alt={ translate( 'Money Back %(days)d-Day Guarantee Badge', {
								args: { days: GUARANTEE_DAYS },
								textOnly: true,
							} ) }
						/>
						<span>
							{ preventWidows(
								translate( '%(days)d day money back guarantee.**', {
									args: { days: GUARANTEE_DAYS },
									comment: '** clause describing the money back guarantee',
								} )
							) }
						</span>
					</div>
				) }
			</div>
		</>
	);
};

export default IntroPricingBanner;
