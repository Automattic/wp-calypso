import { useViewportMatch } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useMemo } from 'react';
import useDetectWindowBoundary from 'calypso/lib/detect-window-boundary';
import { preventWidows } from 'calypso/lib/formatting';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { INTRO_PRICING_DISCOUNT_PERCENTAGE } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { isConnectStore } from 'calypso/my-sites/plans/jetpack-plans/product-grid/utils';
import { JetpackSaleCoupon } from 'calypso/state/marketing/selectors';
import './style.scss';
import guaranteeBadge from './14-day-badge.svg';
import rocket from './rocket.svg';

// since this amount is backed into the badge above we make it a const
const GUARANTEE_DAYS = 14;

interface Props {
	jetpackSaleCoupon?: JetpackSaleCoupon | null;
}

const IntroPricingBannerV2: FunctionComponent< Props > = ( { jetpackSaleCoupon = null } ) => {
	const translate = useTranslate();
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

	const discountPercentage =
		jetpackSaleCoupon !== null ? jetpackSaleCoupon.discount : INTRO_PRICING_DISCOUNT_PERCENTAGE;

	return (
		<>
			<div className="intro-pricing-banner-v2__viewport-sentinel" { ...outerDivProps }></div>
			<div className={ hasCrossed ? 'intro-pricing-banner-v2__sticky' : 'intro-pricing-banner-v2' }>
				<div className="intro-pricing-banner-v2__discount">
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
					<div className="intro-pricing-banner-v2__guarantee">
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

export default IntroPricingBannerV2;
