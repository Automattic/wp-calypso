import { useViewportMatch } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import useDetectWindowBoundary from 'calypso/lib/detect-window-boundary';
import { preventWidows } from 'calypso/lib/formatting';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isConnectStore } from 'calypso/my-sites/plans/jetpack-plans/product-grid/utils';
import {
	getFullJetpackSaleCouponDiscountRatio,
	getHasRequestedJetpackSaleCoupon,
} from 'calypso/state/marketing/selectors';
import getBestIntroOfferDiscount from 'calypso/state/selectors/get-best-intro-offer-discount';
import getIsRequestingIntroOffers from 'calypso/state/selectors/get-is-requesting-into-offers';
import './style.scss';
import guaranteeBadge from './14-day-badge.svg';
import rocket from './rocket.svg';

// since this amount is backed into the badge above we make it a const
const GUARANTEE_DAYS = 14;

interface Props {
	productSlugs: string[];
	siteId: number | 'none';
}

const IntroPricingBanner: FunctionComponent< Props > = ( { productSlugs, siteId = 'none' } ) => {
	const translate = useTranslate();
	const isNotNarrow = useViewportMatch( 'medium', '>=' );
	const fullJetpackSaleDiscount = useSelector( getFullJetpackSaleCouponDiscountRatio ) * 100;
	const hasRequestedCoupon = useSelector( getHasRequestedJetpackSaleCoupon );
	const isRequestingIntroOffers = useSelector( ( state ) =>
		getIsRequestingIntroOffers( state, siteId )
	);
	const highestDiscount = useSelector( ( state ) =>
		getBestIntroOfferDiscount( state, productSlugs, siteId )
	);

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

	const isLoading = ! hasRequestedCoupon || isRequestingIntroOffers;

	const discountPercentage =
		fullJetpackSaleDiscount > 0 ? fullJetpackSaleDiscount : highestDiscount;

	let className;

	if ( isLoading ) {
		className = 'intro-pricing-banner__loading';
	} else if ( hasCrossed ) {
		className = 'intro-pricing-banner__sticky';
	} else {
		className = 'intro-pricing-banner';
	}

	return (
		<>
			<div className="intro-pricing-banner__viewport-sentinel" { ...outerDivProps }></div>
			<div className={ className }>
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
							translate( 'Get up to %(percent)d%% off your first year.', {
								args: {
									percent: discountPercentage,
								},
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
								translate( '%(days)d day money back guarantee.', {
									args: { days: GUARANTEE_DAYS },
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
