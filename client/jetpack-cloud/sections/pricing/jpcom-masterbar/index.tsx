import { ExternalLink } from '@automattic/components';
import { useLocale, localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useEffect, useState, useRef } from 'react';
import * as React from 'react';
import JetpackLogo from 'calypso/components/jetpack-logo';
import JetpackSaleBanner from 'calypso/jetpack-cloud/sections/pricing/sale-banner';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import useDetectWindowBoundary from 'calypso/lib/detect-window-boundary';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isConnectStore } from 'calypso/my-sites/plans/jetpack-plans/product-grid/utils';
import { useSelector } from 'calypso/state';
import { getJetpackSaleCoupon } from 'calypso/state/marketing/selectors';
import { isJetpackCloudCartEnabled } from 'calypso/state/sites/selectors';
import CloudCart from './cloud-cart';
import MenuItems from './components/menu-items';
import MobileMenuButton from './components/mobile-menu-button';
import UserMenu from './components/user-menu';
import { isMobile } from './utils';

import './style.scss';

export const MAIN_CONTENT_ID = 'pricing-content';

const JETPACK_COM_BASE_URL = 'https://jetpack.com';

type Props = {
	pathname?: string;
};

/**
 * WARNING: this component is a reflection of the Jetpack.com header, whose markup is located here:
 * https://opengrok.a8c.com/source/xref/a8c/jetpackme-new/parts/shared/header.php
 *
 * Both headers should stay in sync as much as possible.
 */
const JetpackComMasterbar: React.FC< Props > = ( { pathname } ) => {
	const translate = useTranslate();
	const locale = useLocale();
	const jetpackSaleCoupon = useSelector( getJetpackSaleCoupon );
	const mobileMenu = useRef< HTMLDivElement >( null );
	const [ isMobileMenuOpen, setIsMobileMenuOpen ] = useState( false );

	const shouldShowCart = useSelector( isJetpackCloudCartEnabled );

	const windowBoundaryOffset = useMemo( () => {
		if ( isJetpackCloud() || isConnectStore() ) {
			return 0;
		}

		return 47;
	}, [] );

	const [ barRef, hasCrossed ] = useDetectWindowBoundary( windowBoundaryOffset );

	const outerDivProps = barRef ? { ref: barRef as React.RefObject< HTMLDivElement > } : {};

	const classes = clsx( 'header__content-background-wrapper', {
		'header__content-background-wrapper--sticky': shouldShowCart && hasCrossed,
	} );

	useEffect( () => {
		window.addEventListener( 'resize', () => {
			if ( isMobile() ) {
				document.body.classList.remove( 'no-scroll' );
			}
		} );
	}, [] );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<>
			<div className="jpcom-masterbar">
				<header className="header js-header force-opaque">
					{ jetpackSaleCoupon && <JetpackSaleBanner coupon={ jetpackSaleCoupon } /> }
					<div className="header__content-wrapper">
						<div className="header__content-background-wrapper-sentinal" { ...outerDivProps }></div>
						<div className={ classes }>
							<nav className="header__content is-sticky">
								<a className="header__skip" href={ `#${ MAIN_CONTENT_ID }` }>
									{ translate( 'Skip to main content' ) }
								</a>
								<ExternalLink
									className="header__home-link"
									href={ localizeUrl( JETPACK_COM_BASE_URL, locale ) }
									aria-label={ translate( 'Jetpack home' ) }
									onClick={ () => recordTracksEvent( 'calypso_jetpack_nav_logo_click' ) }
								>
									<JetpackLogo full size={ 38 } />
								</ExternalLink>
								{ shouldShowCart && <CloudCart /> }
								<MobileMenuButton
									isOpen={ isMobileMenuOpen }
									setIsOpen={ setIsMobileMenuOpen }
									mobileMenu={ mobileMenu }
								/>
								<div
									className={ `header__nav-wrapper js-mobile-menu ${
										isMobileMenuOpen ? 'is-expanded' : ''
									}` }
									id="mobile-menu"
									ref={ mobileMenu }
								>
									<MenuItems pathname={ pathname } />
									{ shouldShowCart && <CloudCart /> }
									<UserMenu />
								</div>
							</nav>
						</div>
					</div>
				</header>
			</div>
		</>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default JetpackComMasterbar;
