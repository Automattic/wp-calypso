import { Gridicon } from '@automattic/components';
import { useLocale, localizeUrl } from '@automattic/i18n-utils';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import * as React from 'react';
import ExternalLink from 'calypso/components/external-link';
import JetpackLogo from 'calypso/components/jetpack-logo';
import useJetpackMasterbarDataQuery from 'calypso/data/jetpack/use-jetpack-masterbar-data-query';
import JetpackSaleBanner from 'calypso/jetpack-cloud/sections/pricing/sale-banner';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import useDetectWindowBoundary from 'calypso/lib/detect-window-boundary';
import { getLastFocusableElement } from 'calypso/lib/dom/focus';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { trailingslashit } from 'calypso/lib/route';
import { isConnectStore } from 'calypso/my-sites/plans/jetpack-plans/product-grid/utils';
import { useSelector } from 'calypso/state';
import { getJetpackSaleCoupon } from 'calypso/state/marketing/selectors';
import { isJetpackCloudCartEnabled } from 'calypso/state/sites/selectors';
import CloudCart from './cloud-cart';
import BundlesSection from './components/bundles-section';
import MobileMenuButton from './components/mobile-menu-button';
import UserMenu from './components/user-menu';
import type { MenuItem } from 'calypso/data/jetpack/use-jetpack-masterbar-data-query';

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
	const { data: menuData, status: menuDataStatus } = useJetpackMasterbarDataQuery();
	const mobileMenu = useRef< HTMLDivElement >( null );
	const [ eventHandlersAdded, setEventHandlersAdded ] = useState( false );
	const [ isMobileMenuOpen, setIsMobileMenuOpen ] = useState( false );

	const sortByMenuOrder = ( a: MenuItem, b: MenuItem ) => a.menu_order - b.menu_order;

	const sections = menuData?.sections ? Array.from( Object.values( menuData.sections ) ) : null;
	const bundles = menuData?.bundles ?? null;

	const shouldShowCart = useSelector( isJetpackCloudCartEnabled );

	const windowBoundaryOffset = useMemo( () => {
		if ( isJetpackCloud() || isConnectStore() ) {
			return 0;
		}

		return 47;
	}, [] );

	const [ barRef, hasCrossed ] = useDetectWindowBoundary( windowBoundaryOffset );

	const outerDivProps = barRef ? { ref: barRef as React.RefObject< HTMLDivElement > } : {};

	const classes = classNames( 'header__content-background-wrapper', {
		'header__content-background-wrapper--sticky': shouldShowCart && hasCrossed,
	} );

	const isValidLink = ( url: string ) => {
		return url && url !== '#';
	};

	const onLinkClick = useCallback( ( e: React.MouseEvent< HTMLAnchorElement > ) => {
		recordTracksEvent( 'calypso_jetpack_nav_item_click', {
			nav_item: e.currentTarget
				.getAttribute( 'href' )
				// Remove the hostname https://jetpack.com/ from the href
				// (including other languages, ie. es.jetpack.com, fr.jetpack.com, etc.)
				?.replace( /https?:\/\/[a-z]{0,2}.?jetpack.com/, '' ),
		} );
	}, [] );

	// All the functionality in this useEffect is copied from the old js files that were copied from jetpack.com
	// They were moved here due to the new data query causing the header to re-render and add too many event listeners
	// This will be refactored very soon
	useEffect( () => {
		// SUBMENU TOGGLE FUNCTIONALITY
		function toggleMenuItem( btn: HTMLAnchorElement, menu: HTMLDivElement ) {
			const expanded = btn.getAttribute( 'aria-expanded' ) === 'true' || false;
			btn.setAttribute( 'aria-expanded', String( ! expanded ) );

			menu.hidden = ! menu.hidden;
		}

		function collapseExpandedMenu() {
			const expandedBtn = document.querySelector(
				'.js-menu-btn[aria-expanded="true"]'
			) as HTMLAnchorElement;

			if ( expandedBtn ) {
				const menu = expandedBtn?.parentNode?.querySelector( '.js-menu' ) as HTMLDivElement;

				if ( menu ) {
					toggleMenuItem( expandedBtn, menu );
				}
			}
		}

		function initMenu( btn: HTMLAnchorElement ) {
			const menu = btn?.parentNode?.querySelector( '.js-menu' ) as HTMLDivElement;

			if ( ! menu ) {
				return;
			}

			const toggleSubmenu = function () {
				toggleMenuItem( btn, menu );
			};

			menu.addEventListener( 'click', function ( e ) {
				// If user clicks menu backdrop
				if ( e.target === menu ) {
					toggleSubmenu();
				}
			} );

			btn.addEventListener( 'click', function ( e ) {
				e.preventDefault();

				if ( btn.getAttribute( 'aria-expanded' ) === 'false' ) {
					collapseExpandedMenu();
				}

				toggleSubmenu();
			} );

			const backBtn = menu.querySelector( '.js-menu-back' );

			if ( backBtn ) {
				backBtn.addEventListener( 'click', function () {
					toggleSubmenu();
				} );
			}

			// Collapse menu when focusing out
			const lastFocusable = getLastFocusableElement( menu );

			if ( lastFocusable ) {
				lastFocusable.addEventListener( 'focusout', toggleSubmenu );
			}
		}

		// Close expanded menu on Esc keypress
		function onKeyDown( e: KeyboardEvent ) {
			if ( e.key === 'Escape' ) {
				collapseExpandedMenu();
			}
		}
		// END SUBMENU TOGGLE FUNCTIONALITY

		if ( menuDataStatus === 'success' && ! eventHandlersAdded ) {
			setEventHandlersAdded( true );

			// SUBMENU SETUP
			const menuBtns = document.querySelectorAll( '.js-menu-btn' );

			Array.prototype.forEach.call( menuBtns, initMenu );

			document.addEventListener( 'keydown', onKeyDown );
			// END SUBMENU SETUP

			return () => {
				document.removeEventListener( 'keydown', onKeyDown );
			};
		}
	}, [ menuDataStatus, eventHandlersAdded ] );

	useEffect( () => {
		window.addEventListener( 'resize', () => {
			const body = document.querySelector( 'body' );
			if ( window.innerWidth > 900 ) {
				body?.classList.remove( 'no-scroll' );
			}
		} );
	}, [] );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<>
			{ jetpackSaleCoupon && <JetpackSaleBanner coupon={ jetpackSaleCoupon } /> }

			<div className="jpcom-masterbar">
				<header className="header js-header force-opaque">
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
									<ul className="header__sections-list js-nav-list">
										{ menuDataStatus === 'success' && sections ? (
											sections.sort( sortByMenuOrder ).map( ( { label, id, href, items } ) => {
												const hasChildren = Object.keys( items ).length > 0;
												const MainMenuTag = hasChildren ? 'a' : ExternalLink;

												return (
													<li
														className={ classNames( {
															'is-active':
																pathname &&
																isValidLink( href ) &&
																new URL( trailingslashit( href ) ).pathname ===
																	trailingslashit( pathname ),
														} ) }
														key={ `main-menu-${ href }${ label }` }
													>
														<MainMenuTag
															className={ hasChildren ? 'header__menu-btn js-menu-btn' : '' }
															href={
																isValidLink( href ) ? localizeUrl( href, locale ) : `#${ id }`
															}
															aria-expanded={ hasChildren ? false : undefined }
															onClick={ isValidLink( href ) ? onLinkClick : undefined }
														>
															{ label }
															{ hasChildren && <Gridicon icon="chevron-down" size={ 18 } /> }
														</MainMenuTag>
														{ hasChildren && (
															<div
																id={ id }
																className="header__submenu js-menu js"
																tabIndex={ -1 }
																hidden
															>
																<div className="header__submenu-content">
																	<div className="header__submenu-wrapper">
																		<button className="header__back-btn js-menu-back">
																			<Gridicon icon="chevron-left" size={ 18 } />
																			{ translate( 'Back' ) }
																		</button>
																		<ul className="header__submenu-categories-list">
																			{ Array.from( Object.values( items ) )
																				.sort( sortByMenuOrder )
																				.map( ( { label, href, items } ) => {
																					return (
																						<li key={ `submenu-category-${ href }${ label }` }>
																							{ isValidLink( href ) ? (
																								<ExternalLink
																									className="header__submenu-category header__submenu-link"
																									href={ localizeUrl( href, locale ) }
																									onClick={ onLinkClick }
																								>
																									<span className="header__submenu-label">
																										{ label }
																									</span>
																								</ExternalLink>
																							) : (
																								<p className="header__submenu-category header__submenu-link">
																									<span className="header__submenu-label">
																										{ label }
																									</span>
																								</p>
																							) }
																							<ul className="header__submenu-links-list">
																								{ Array.from( Object.values( items ) )
																									.sort( sortByMenuOrder )
																									.map( ( { label, href } ) => (
																										<li key={ `submenu-${ href }${ label }` }>
																											<ExternalLink
																												className="header__submenu-link"
																												href={ localizeUrl( href, locale ) }
																												onClick={ onLinkClick }
																											>
																												<span className="header__submenu-label">
																													{ label }
																												</span>
																											</ExternalLink>
																										</li>
																									) ) }
																							</ul>
																						</li>
																					);
																				} ) }
																		</ul>
																		<BundlesSection bundles={ bundles } />
																	</div>
																</div>
															</div>
														) }
													</li>
												);
											} )
										) : (
											<></>
										) }
									</ul>
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
