import { Gridicon } from '@automattic/components';
import { useLocale, localizeUrl } from '@automattic/i18n-utils';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, Fragment, useEffect, useState } from 'react';
import * as React from 'react';
import ExternalLink from 'calypso/components/external-link';
import Gravatar from 'calypso/components/gravatar';
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
import { isUserLoggedIn, getCurrentUser } from 'calypso/state/current-user/selectors';
import { getJetpackSaleCoupon } from 'calypso/state/marketing/selectors';
import { isJetpackCloudCartEnabled } from 'calypso/state/sites/selectors';
import CloudCart from './cloud-cart';
import AntispamIcon from './icons/jetpack-bundle-icon-antispam';
import BackupIcon from './icons/jetpack-bundle-icon-backup';
import BoostIcon from './icons/jetpack-bundle-icon-boost';
import CRMIcon from './icons/jetpack-bundle-icon-crm';
import ScanIcon from './icons/jetpack-bundle-icon-scan';
import SearchIcon from './icons/jetpack-bundle-icon-search';
import SocialIcon from './icons/jetpack-bundle-icon-social';
import VideopressIcon from './icons/jetpack-bundle-icon-videopress';
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
	const isLoggedIn = useSelector( isUserLoggedIn );
	const user = useSelector( getCurrentUser );
	const { data: menuData, status: menuDataStatus } = useJetpackMasterbarDataQuery();
	const [ eventHandlersAdded, setEventHandlersAdded ] = useState( false );

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

	const getBundleIcons = ( bundle: string ) => {
		// Using a soft match in case the menu item gets deleted and recreated in wp-admin
		// causing the name to change to `complete-2` or something similar.
		if ( bundle.includes( 'complete' ) ) {
			return [
				<BackupIcon />,
				<AntispamIcon />,
				<ScanIcon />,
				<SearchIcon />,
				<SocialIcon />,
				<VideopressIcon />,
				<CRMIcon />,
				<BoostIcon />,
			];
		}

		if ( bundle.includes( 'security' ) ) {
			return [ <BackupIcon />, <AntispamIcon />, <ScanIcon /> ];
		}

		return [];
	};

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

		// USER MENU FUNCTIONALITY
		const userMenu = document.querySelector( '.js-user-menu' ) as HTMLDivElement;
		const userBtn = document.querySelector( '.js-user-menu-btn' ) as HTMLAnchorElement;

		function onDocumentClick( { target }: MouseEvent ) {
			if ( ! userMenu?.contains( target as Node ) ) {
				userBtn?.setAttribute( 'aria-expanded', 'false' );
				userMenu.hidden = true;
			}
		}

		function toggleUserMenu() {
			const expanded = userBtn.getAttribute( 'aria-expanded' ) === 'true' || false;

			if ( expanded ) {
				document.removeEventListener( 'click', onDocumentClick );
			} else {
				document.addEventListener( 'click', onDocumentClick );
			}

			userBtn.setAttribute( 'aria-expanded', String( ! expanded ) );
			userMenu.hidden = ! userMenu.hidden;
		}

		function onUserBtnClick( e: MouseEvent ) {
			e.preventDefault();
			e.stopPropagation();

			toggleUserMenu();
		}
		// END USER MENU FUNCTIONALITY

		// MOBILE MENU FUNCTIONALITY
		const MOBILE_BP = 900; // lrg-screen breakpoint
		const mobileMenu = document.querySelector( '.js-mobile-menu' ) as HTMLDivElement;
		const mobileBtn = document.querySelector( '.js-mobile-btn' );
		const body = document.querySelector( 'body' );

		function mobileMenuToggle() {
			const expanded = mobileBtn?.getAttribute( 'aria-expanded' ) === 'true' || false;

			mobileBtn?.setAttribute( 'aria-expanded', String( ! expanded ) );

			if ( ! expanded ) {
				mobileMenu?.classList.add( 'is-expanded' );
				body?.classList.add( 'no-scroll' );
			} else {
				mobileMenu?.classList.remove( 'is-expanded' );
				body?.classList.remove( 'no-scroll' );
			}
		}

		// Close expanded menu on Esc keypress
		function mobileOnKeyDown( e: KeyboardEvent ) {
			if ( e.key === 'Escape' && mobileBtn?.getAttribute( 'aria-expanded' ) === 'true' ) {
				mobileMenuToggle();
			}
		}

		function onResize() {
			if ( window.innerWidth > MOBILE_BP ) {
				body?.classList.remove( 'no-scroll' );
			}
		}
		// END MOBILE MENU FUNCTIONALITY

		if ( menuDataStatus === 'success' && ! eventHandlersAdded ) {
			setEventHandlersAdded( true );

			// SUBMENU SETUP
			const menuBtns = document.querySelectorAll( '.js-menu-btn' );

			Array.prototype.forEach.call( menuBtns, initMenu );

			document.addEventListener( 'keydown', onKeyDown );
			// END SUBMENU SETUP

			// USER MENU SETUP
			if ( userMenu && userBtn ) {
				userBtn.addEventListener( 'click', onUserBtnClick );

				const lastFocusable = getLastFocusableElement( userMenu );
				// Collapse menu when focusing out

				if ( lastFocusable ) {
					lastFocusable.addEventListener( 'focusout', toggleUserMenu );
				}
			}
			// END MENU SETUP

			// MOBILE MENU SETUP
			if ( mobileMenu && mobileBtn ) {
				mobileBtn.addEventListener( 'click', function ( e ) {
					e.preventDefault();

					mobileMenuToggle();
				} );

				const lastFocusable = getLastFocusableElement( mobileMenu );

				if ( lastFocusable ) {
					lastFocusable.addEventListener( 'focusout', function () {
						if ( mobileBtn.getAttribute( 'aria-expanded' ) === 'true' ) {
							mobileMenuToggle();
						}
					} );
				}

				window.addEventListener( 'resize', onResize );
				document.addEventListener( 'keydown', mobileOnKeyDown );
			}
			// END MOBILE SETUP

			return () => {
				document.removeEventListener( 'keydown', onKeyDown );
				document.removeEventListener( 'click', onDocumentClick );
				window.removeEventListener( 'resize', onResize );
				document.removeEventListener( 'keydown', mobileOnKeyDown );
			};
		}
	}, [ menuDataStatus, eventHandlersAdded ] );

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
								<a
									className="header__mobile-btn mobile-btn js-mobile-btn"
									href="#mobile-menu"
									aria-expanded="false"
								>
									<span className="mobile-btn__icon" aria-hidden="true">
										<span className="mobile-btn__inner"></span>
									</span>
									<span className="mobile-btn__label">{ translate( 'Menu' ) }</span>
								</a>
								<div className="header__nav-wrapper js-mobile-menu" id="mobile-menu">
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

																		<div className="header__submenu-bottom-section">
																			<div className="header__submenu-bundles">
																				<p className="header__submenu-category-heading">
																					{ bundles?.label }
																				</p>

																				<ul className="header__submenu-links-list">
																					{ bundles &&
																						Array.from( Object.values( bundles.items ) )
																							.sort( sortByMenuOrder )
																							.map( ( { id, label, href } ) => (
																								<li key={ `bundles-${ href }-${ label }` }>
																									<ExternalLink
																										className="header__submenu-link"
																										href={ localizeUrl( href, locale ) }
																										onClick={ onLinkClick }
																									>
																										<p className="header__submenu-label">
																											<span>{ label }</span>
																										</p>
																										<div className="header__submenu-bundle-icons">
																											{ getBundleIcons( id ).map(
																												( icon, index ) => (
																													<Fragment
																														key={ `bundle-icon-${ id }${ index }` }
																													>
																														{ icon }
																													</Fragment>
																												)
																											) }
																										</div>
																									</ExternalLink>
																								</li>
																							) ) }
																				</ul>
																			</div>
																		</div>
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
									<ul className="header__actions-list">
										<li
											className={ classNames( 'header__user-menu user-menu ', {
												'is-logged-in': isLoggedIn,
											} ) }
										>
											{ isLoggedIn ? (
												<>
													<a className="user-menu__btn js-user-menu-btn" href="#profile">
														<Gravatar user={ user } className="user-menu__avatar" />
													</a>
													<div id="profile" className="user-menu__tooltip js-user-menu js" hidden>
														<div className="tooltip">
															<span className="user-menu__greetings">
																{ translate( 'Hi, %s!', {
																	args: user?.display_name || user?.username,
																} ) }
															</span>
															<ul className="user-menu__list">
																<li>
																	<a
																		className="js-manage-sites"
																		href={ localizeUrl( '/', locale ) }
																	>
																		{ translate( 'Manage your sites' ) }
																	</a>
																</li>
															</ul>
														</div>
													</div>
												</>
											) : (
												<a
													className="header__action-link js-login"
													href={ localizeUrl( '/login/', locale ) }
												>
													{ translate( 'Log in' ) }
												</a>
											) }
										</li>
									</ul>
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
