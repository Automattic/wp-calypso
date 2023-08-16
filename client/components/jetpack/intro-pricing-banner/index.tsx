import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import CloudCart from 'calypso/jetpack-cloud/sections/pricing/jpcom-masterbar/cloud-cart';
import useDetectWindowBoundary from 'calypso/lib/detect-window-boundary';
import { preventWidows } from 'calypso/lib/formatting';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import {
	GUARANTEE_DAYS,
	INTRO_PRICING_DISCOUNT_PERCENTAGE,
} from 'calypso/my-sites/plans/jetpack-plans/constants';
import { isConnectStore } from 'calypso/my-sites/plans/jetpack-plans/product-grid/utils';
import { useSelector } from 'calypso/state';
import './style.scss';
import { isJetpackCloudCartEnabled } from 'calypso/state/sites/selectors';
import guaranteeBadge from './14-day-badge.svg';
import useBoundingClientRect from './hooks/use-bounding-client-rect';
import { usePrevious } from './hooks/use-previous';
import people from './people.svg';
import rocket from './rocket.svg';

const CALYPSO_MASTERBAR_HEIGHT = 47;
const CLOUD_MASTERBAR_HEIGHT = 47;
const CONNECT_STORE_HEIGHT = 0;

const IntroPricingBanner: React.FC = () => {
	const translate = useTranslate();
	const shouldShowCart = useSelector( isJetpackCloudCartEnabled );
	const clientRect = useBoundingClientRect( '.header__content .header__jetpack-masterbar-cart' );
	const isSmallScreen = useBreakpoint( '<660px' );

	const windowBoundaryOffset = useMemo( () => {
		if ( isJetpackCloud() ) {
			return CLOUD_MASTERBAR_HEIGHT;
		} else if ( isConnectStore() ) {
			return CONNECT_STORE_HEIGHT;
		}
		return CALYPSO_MASTERBAR_HEIGHT;
	}, [] );

	const [ barRef, hasCrossed ] = useDetectWindowBoundary( windowBoundaryOffset );

	const prevHasCrossed = usePrevious( hasCrossed );

	useEffect( () => {
		if ( ! shouldShowCart ) {
			return;
		}
		const navHeaderEle = document.getElementsByClassName( 'header__content-background-wrapper' );
		if ( ! navHeaderEle || ! navHeaderEle.length ) {
			return;
		}

		if ( hasCrossed ) {
			navHeaderEle[ 0 ].classList.remove( 'header__content-background-wrapper--sticky' );
		} else if ( prevHasCrossed && ! hasCrossed ) {
			navHeaderEle[ 0 ].classList.add( 'header__content-background-wrapper--sticky' );
		}
	}, [ hasCrossed, prevHasCrossed, shouldShowCart ] );

	const outerDivProps = barRef ? { ref: barRef as React.RefObject< HTMLDivElement > } : {};

	return (
		<>
			<div className="intro-pricing-banner__viewport-sentinel" { ...outerDivProps }></div>
			<div className="intro-pricing-banner">
				<div className="intro-pricing-banner__content">
					<div className="intro-pricing-banner__item">
						<img className="intro-pricing-banner__item-icon" src={ rocket } alt="" />
						<span className="intro-pricing-banner__item-label">
							{ preventWidows(
								translate( 'Get up to %(percent)d% off your first year', {
									args: { percent: INTRO_PRICING_DISCOUNT_PERCENTAGE },
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
							href={ localizeUrl( 'https://jetpack.com/for/agencies/' ) }
							target="_blank"
							rel="noreferrer"
						>
							{ preventWidows( translate( 'Explore Jetpack for Agencies' ) ) }
						</a>
					</div>
					{ shouldShowCart && hasCrossed && (
						<CloudCart cartStyle={ isSmallScreen ? {} : { left: clientRect.left } } />
					) }
				</div>
			</div>
		</>
	);
};

export default IntroPricingBanner;
