import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import useDetectWindowBoundary from 'calypso/lib/detect-window-boundary';
import { preventWidows } from 'calypso/lib/formatting';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { GUARANTEE_DAYS } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { isConnectStore } from 'calypso/my-sites/plans/jetpack-plans/product-grid/utils';
import './style.scss';
import guaranteeBadge from './14-day-badge.svg';
import people from './people.svg';

const CALYPSO_MASTERBAR_HEIGHT = 47;
const CLOUD_MASTERBAR_HEIGHT = 0;

const IntroPricingBanner: React.FC = () => {
	const translate = useTranslate();

	const windowBoundaryOffset = useMemo( () => {
		if ( isJetpackCloud() || isConnectStore() ) {
			return CLOUD_MASTERBAR_HEIGHT;
		}

		return CALYPSO_MASTERBAR_HEIGHT;
	}, [] );
	const [ barRef, hasCrossed ] = useDetectWindowBoundary( windowBoundaryOffset );

	const outerDivProps = barRef ? { ref: barRef as React.RefObject< HTMLDivElement > } : {};

	let classModifier = '';

	if ( hasCrossed ) {
		classModifier = 'is-sticky';
	}

	return (
		<>
			<div className="intro-pricing-banner__viewport-sentinel" { ...outerDivProps }></div>
			<div className={ `intro-pricing-banner ${ classModifier }` }>
				<div className="intro-pricing-banner__content">
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
			</div>
		</>
	);
};

export default IntroPricingBanner;
