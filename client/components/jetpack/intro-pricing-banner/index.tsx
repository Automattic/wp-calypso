import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import useDetectWindowBoundary from 'calypso/lib/detect-window-boundary';
import { preventWidows } from 'calypso/lib/formatting';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { GUARANTEE_DAYS } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { isConnectStore } from 'calypso/my-sites/plans/jetpack-plans/product-grid/utils';
import {
	getFullJetpackSaleCouponDiscountRatio,
	getHasRequestedJetpackSaleCoupon,
} from 'calypso/state/marketing/selectors';
import getBestIntroOfferDiscount from 'calypso/state/selectors/get-best-intro-offer-discount';
import getIsRequestingIntroOffers from 'calypso/state/selectors/get-is-requesting-into-offers';
import './style.scss';
import guaranteeBadge from './14-day-badge.svg';
import people from './people.svg';
import rocket from './rocket.svg';

interface Props {
	productSlugs: string[];
	siteId: number | 'none';
}

const IntroPricingBanner: FunctionComponent< Props > = ( { productSlugs, siteId = 'none' } ) => {
	const translate = useTranslate();
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

	let classModifier = '';

	if ( isLoading ) {
		classModifier = 'is-loading';
	} else if ( hasCrossed ) {
		classModifier = 'is-sticky';
	}

	return (
		<>
			<div className="intro-pricing-banner__viewport-sentinel" { ...outerDivProps }></div>
			<div className={ `intro-pricing-banner ${ classModifier }` }>
				{ ( discountPercentage > 0 || isLoading ) && (
					<div className="intro-pricing-banner__content">
						<div className="intro-pricing-banner__item">
							<img className="intro-pricing-banner__item-icon" src={ rocket } alt="" />
							<span className="intro-pricing-banner__item-label">
								{ preventWidows(
									translate( 'Get up to %(percent)d%% off your first year.', {
										args: {
											percent: discountPercentage,
										},
									} )
								) }
							</span>
						</div>
						<div className="intro-pricing-banner__item">
							<img className="intro-pricing-banner__item-icon" src={ guaranteeBadge } alt="" />
							<span className="intro-pricing-banner__item-label">
								{ preventWidows(
									translate( '%(days)d day money back guarantee.', {
										args: { days: GUARANTEE_DAYS },
									} )
								) }
							</span>
						</div>
						<div className="intro-pricing-banner__item is-agencies">
							<img className="intro-pricing-banner__item-icon" src={ people } alt="" />
							<a
								className="intro-pricing-banner__item-label is-link"
								onClick={ () =>
									recordTracksEvent( 'calypso_jpcom_agencies_page_intro_banner_link_click' )
								}
								href="https://jetpack.com/for/agencies/"
								target="_blank"
								rel="noreferrer"
							>
								{ preventWidows( translate( 'Explore Jetpack for Agencies' ) ) }
							</a>
						</div>
					</div>
				) }
			</div>
		</>
	);
};

export default IntroPricingBanner;
