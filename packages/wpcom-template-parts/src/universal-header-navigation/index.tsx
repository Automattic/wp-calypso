/* eslint-disable no-restricted-imports */
import { WordPressWordmark } from '@automattic/components';
import { useLocalizeUrl, useIsEnglishLocale, useLocale } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { HeaderProps } from '../types';
import { NonClickableItem, ClickableItem } from './menu-items';
import { Nav2026DesktopDropdown } from './nav-2026/desktop-dropdown';
import {
	useMobilePlatform,
	useScrollState,
	useDropdownOffset,
	useFooterHeight,
	useDropdownFlip,
} from './nav-2026/hooks';
import { Nav2026MobileMenu } from './nav-2026/mobile-menu';
import { getNav2026Menus } from './nav-2026/taxonomy';
import {
	recordNavItemHover,
	recordSubmenuShow,
	recordSubmenuHide,
	recordMobileMenuOpen,
	recordMobileMenuClose,
	recordMobileCategorySelect,
	recordMobileBack,
	recordNavLinkClick,
	resetNavHoverDedupe,
	bindLegacyNavTracks,
	recordLegacyMobileMenuOpen,
	recordLegacyMobileMenuClose,
} from './nav-2026/tracks';
import './style.scss';

const UniversalNavbarHeader = ( {
	className,
	hideGetStartedCta = false,
	isLoggedIn = false,
	sectionName,
	logoColor,
	variant = 'default',
	startUrl,
	loginUrl,
	nav2026 = false,
	nav2026Variant = 1,
	userAvatar,
	userName,
	userEmail,
}: HeaderProps ) => {
	const locale = useLocale();
	const localizeUrl = useLocalizeUrl();
	const { __ } = useI18n();
	const [ isMobileMenuOpen, setMobileMenuOpen ] = useState( false );
	// Mobile drill-down: which category is expanded (null = top level).
	const [ currentDropdown, setCurrentDropdown ] = useState< string | null >( null );
	// Desktop dropdown: which top-level menu is open (null = none).
	const [ activeDropdown, setActiveDropdown ] = useState< string | null >( null );
	// First open uses the long reveal delay; later drill/back uses the quick fade.
	const [ isMenuOpening, setIsMenuOpening ] = useState( false );
	const mobileFooterRef = useRef< HTMLDivElement >( null );
	// Hamburger, so closing the menu can return focus to it.
	const menuTriggerRef = useRef< HTMLButtonElement >( null );
	const isEnglishLocale = useIsEnglishLocale();
	// Tabbable only while the menu is open.
	const mobileMenuTabIndex = isMobileMenuOpen ? undefined : -1;

	const mobilePlatform = useMobilePlatform( nav2026 );
	const isScrolled = useScrollState( nav2026 );
	// Mirror `isScrolled` into a ref so event callbacks can read it for the
	// `is_floating` Tracks prop without re-subscribing on every scroll.
	const isScrolledRef = useRef( isScrolled );
	isScrolledRef.current = isScrolled;
	const prevDropdownRef = useRef< string | null >( null );
	// The <nav> element, so the legacy arm can bind DOM-listener telemetry.
	const legacyNavRef = useRef< HTMLElement >( null );
	useDropdownOffset( nav2026, nav2026Variant );
	useFooterHeight( {
		nav2026,
		isMobileMenuOpen,
		isLoggedIn,
		mobilePlatform,
		footerRef: mobileFooterRef,
	} );
	const dropdownRef = useDropdownFlip( { nav2026, activeDropdown } );

	const nav2026Menus = useMemo(
		() =>
			nav2026
				? getNav2026Menus( { __, localizeUrl, locale, isLoggedIn, variant: nav2026Variant } )
				: [],
		[ nav2026, __, localizeUrl, locale, isLoggedIn, nav2026Variant ]
	);
	const activeCategory = nav2026Menus.find( ( menu ) => menu.name === currentDropdown );

	const closeMobileMenu = useCallback(
		( reason = 'close_button' ) => {
			setMobileMenuOpen( ( open ) => {
				if ( open && nav2026 ) {
					recordMobileMenuClose( isScrolledRef.current, reason );
				}
				return false;
			} );
			setCurrentDropdown( null );
			menuTriggerRef.current?.focus();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		[ nav2026 ]
	);

	// Desktop dropdown open/switch/close: emit submenu show for the newly-open
	// menu and hide for the one it replaced. Driven by `activeDropdown` so it
	// covers hover, focus, and keyboard dismiss uniformly.
	useEffect( () => {
		if ( ! nav2026 ) {
			return;
		}
		const prev = prevDropdownRef.current;
		const next = activeDropdown;
		prevDropdownRef.current = next;
		if ( prev === next ) {
			return;
		}
		if ( prev ) {
			recordSubmenuHide( isScrolledRef.current, prev );
		}
		if ( next ) {
			recordSubmenuShow( isScrolledRef.current, next );
		} else {
			// Fully closed — let the next open of the same item re-emit a hover.
			resetNavHoverDedupe();
		}
	}, [ nav2026, activeDropdown ] );

	const openMobileMenu = useCallback( () => {
		if ( nav2026 ) {
			recordMobileMenuOpen( isScrolledRef.current );
			setIsMenuOpening( true );
		}
		setMobileMenuOpen( true );
	}, [ nav2026 ] );

	// Old-nav hamburger open/close, recording the usage events.
	const openLegacyMobileMenu = useCallback( () => {
		recordLegacyMobileMenuOpen();
		setMobileMenuOpen( true );
	}, [] );

	const closeLegacyMobileMenu = useCallback( ( reason: string ) => {
		recordLegacyMobileMenuClose( reason );
		setMobileMenuOpen( false );
	}, [] );

	// Mobile drill-down: select a category or go Back, recording either.
	const selectMobileCategory = useCallback(
		( name: string | null ) => {
			if ( nav2026 ) {
				if ( name ) {
					const title = nav2026Menus.find( ( menu ) => menu.name === name )?.title ?? '';
					recordMobileCategorySelect( isScrolledRef.current, name, title );
				} else {
					recordMobileBack( isScrolledRef.current, currentDropdown );
				}
			}
			setCurrentDropdown( name );
		},
		[ nav2026, currentDropdown, nav2026Menus ]
	);

	// `is-opening` while the panel slides in. 1100ms ≈ slide 340 + reveal 430 + fade 300.
	useEffect( () => {
		if ( ! nav2026 || ! isMobileMenuOpen ) {
			setIsMenuOpening( false );
			return;
		}
		setIsMenuOpening( true );
		const timer = setTimeout( () => setIsMenuOpening( false ), 1100 );
		return () => clearTimeout( timer );
	}, [ nav2026, isMobileMenuOpen ] );

	// The old nav fires its hover/submenu usage events via DOM listeners (it has no
	// React state to hook); the new nav fires them from its handlers below.
	useEffect( () => {
		if ( nav2026 || ! legacyNavRef.current ) {
			return;
		}
		return bindLegacyNavTracks( legacyNavRef.current );
	}, [ nav2026 ] );

	// Escape closes whichever is open (desktop dropdown or mobile menu); hover/focus keeps one open.
	useEffect( () => {
		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				// Desktop dropdown — return focus to the trigger.
				setActiveDropdown( ( open ) => {
					if ( open !== null ) {
						const trigger = document.querySelector< HTMLElement >(
							'.x-nav-item__wide [aria-expanded="true"]'
						);
						trigger?.focus();
					}
					return null;
				} );

				// Mobile menu — return focus to the hamburger.
				setMobileMenuOpen( ( open ) => {
					if ( open ) {
						if ( nav2026 ) {
							recordMobileMenuClose( isScrolledRef.current, 'escape' );
						} else {
							recordLegacyMobileMenuClose( 'escape' );
						}
						setCurrentDropdown( null );
						menuTriggerRef.current?.focus();
					}
					return false;
				} );

				const activeElement = document.activeElement;
				if ( activeElement && activeElement.closest( '[role="menu"], .x-dropdown-content' ) ) {
					if ( activeElement instanceof HTMLElement ) {
						activeElement.blur();
					}
				}
			}
		};

		const closeOtherDropdowns = ( currentNavItem: Element ) => {
			document.querySelectorAll( '.x-nav-item__wide' ).forEach( ( item ) => {
				if ( item !== currentNavItem ) {
					const focusedElement = item.querySelector( ':focus' );
					if ( focusedElement instanceof HTMLElement ) {
						focusedElement.blur();
					}
				}
			} );
		};

		const handleInteraction = ( event: Event ) => {
			const target = event.target;
			if ( ! ( target instanceof HTMLElement ) ) {
				return;
			}

			const navItem = target.closest( '.x-nav-item__wide' );
			if ( navItem ) {
				closeOtherDropdowns( navItem );
			}
		};

		document.addEventListener( 'focusin', handleInteraction );
		document.addEventListener( 'mouseenter', handleInteraction, true );
		document.addEventListener( 'keydown', handleKeyDown );

		return () => {
			document.removeEventListener( 'focusin', handleInteraction );
			document.removeEventListener( 'mouseenter', handleInteraction, true );
			document.removeEventListener( 'keydown', handleKeyDown );
		};
	}, [ nav2026 ] );

	if ( ! startUrl ) {
		const startPaths: Record< string, string > = {
			plugins: '//wordpress.com/start/business',
			reader: '//wordpress.com/start/reader',
		};
		const startPath = ( sectionName && startPaths[ sectionName ] ) ?? '//wordpress.com/start';

		startUrl = addQueryArgs(
			localizeUrl( startPath, locale, isLoggedIn ),
			sectionName ? { ref: sectionName + '-lp' } : {}
		);
	}

	return (
		<div
			className={ clsx( className, {
				'is-themes-dark-mode-monochrome':
					isLoggedIn && ( sectionName === 'themes' || sectionName === 'theme' ),
			} ) }
		>
			<div className="x-root lpc-header-nav-wrapper">
				{ /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */ }
				<div
					className={ clsx( 'lpc-header-nav-container', {
						'is-scrolled': nav2026 && isScrolled,
					} ) }
					onMouseLeave={ nav2026 ? () => setActiveDropdown( null ) : undefined }
					onBlur={
						nav2026
							? ( event ) => {
									// Close when focus leaves the nav entirely (keyboard dismiss).
									if ( ! event.currentTarget.contains( event.relatedTarget as Node ) ) {
										setActiveDropdown( null );
									}
							  }
							: undefined
					}
				>
					{ /*<!-- Nav bar starts here. -->*/ }
					<div className="masterbar-menu">
						<div className="masterbar">
							<nav
								ref={ legacyNavRef }
								className={ clsx( 'x-nav', { 'x-nav--2026-redesign': nav2026 } ) }
								aria-label="WordPress.com"
							>
								<ul className="x-nav-list x-nav-list__left" role="menu">
									<li
										className="x-nav-item"
										role="none"
										onMouseEnter={
											nav2026
												? () => {
														recordNavItemHover( isScrolled, 'logo', false );
														// Hovering a non-dropdown item closes the open dropdown.
														setActiveDropdown( null );
												  }
												: undefined
										}
										// Keyboard parity: focusing into the logo also closes the open dropdown.
										onFocusCapture={ nav2026 ? () => setActiveDropdown( null ) : undefined }
									>
										<a
											role="menuitem"
											className="x-nav-link x-nav-link__logo x-link"
											href={ localizeUrl( '//wordpress.com' ) }
											target="_self"
											onClick={ ( event ) => recordNavLinkClick( event.currentTarget ) }
										>
											<WordPressWordmark
												className="x-icon x-icon__logo"
												color={ logoColor ?? 'var(--studio-blue-50)' }
												size={ {
													width: 170,
													height: 36,
												} }
											/>
											<span className="x-hidden">WordPress.com</span>
										</a>
									</li>
									{ variant !== 'minimal' && nav2026 && (
										<>
											{ nav2026Menus.map( ( menu ) =>
												menu.groups ? (
													<li
														className="x-nav-item x-nav-item__wide"
														role="none"
														key={ menu.name }
														onMouseEnter={ () => {
															recordNavItemHover( isScrolled, menu.name, true );
															setActiveDropdown( menu.name );
														} }
														onFocus={ () => {
															recordNavItemHover( isScrolled, menu.name, true );
															setActiveDropdown( menu.name );
														} }
													>
														<NonClickableItem
															className="x-nav-link x-link"
															content={ menu.title }
															ariaExpanded={ activeDropdown === menu.name }
															ariaControls={ `x-dropdown-2026-${ menu.name }` }
														/>
													</li>
												) : (
													<ClickableItem
														key={ menu.name }
														className="x-nav-item x-nav-item__wide"
														titleValue=""
														content={ menu.title }
														urlValue={ menu.href }
														type="nav"
														target="_self"
														onItemMouseEnter={ () => {
															recordNavItemHover( isScrolled, menu.name, false );
															// Hovering a non-dropdown item closes the open dropdown.
															setActiveDropdown( null );
														} }
														// Keyboard parity: focusing the item also closes the open dropdown.
														onItemFocus={ () => setActiveDropdown( null ) }
													/>
												)
											) }
										</>
									) }
									{ variant !== 'minimal' && ! nav2026 && (
										<>
											<li className="x-nav-item x-nav-item__wide" role="none">
												<NonClickableItem
													className="x-nav-link x-link"
													content={ __( 'Products', __i18n_text_domain__ ) }
												/>
												<div
													className="x-dropdown-content"
													data-dropdown-name="products"
													role="menu"
													aria-label={ __( 'Products', __i18n_text_domain__ ) }
													aria-hidden="true"
												>
													<ul>
														<ClickableItem
															titleValue=""
															content={ __( 'WordPress Hosting', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/hosting/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'WordPress for Agencies', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/for-agencies/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'Become an Affiliate', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/affiliates/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'Domain Names', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/domains/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'AI Website Builder', __i18n_text_domain__ ) }
															urlValue={ localizeUrl(
																'//wordpress.com/ai-website-builder/?ref=topnav'
															) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'Website Builder', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/website-builder/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'Create a Blog', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/create-blog/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'Newsletter', __i18n_text_domain__ ) }
															urlValue={ localizeUrl(
																'//wordpress.com/newsletter/',
																locale,
																isLoggedIn,
																true
															) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'Professional Email', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/professional-email/' ) }
															type="dropdown"
															target="_self"
														/>
														{ isEnglishLocale && (
															<ClickableItem
																titleValue=""
																content={ __( 'Website Design Services', __i18n_text_domain__ ) }
																urlValue={ localizeUrl(
																	'//wordpress.com/website-design-service/'
																) }
																type="dropdown"
																target="_self"
															/>
														) }
														<ClickableItem
															titleValue=""
															content={ __( 'Commerce', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/ecommerce/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'WordPress Studio', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//developer.wordpress.com/studio/' ) }
															type="dropdown"
															target="_self"
														/>
													</ul>
													<div className="x-dropdown-content-separator"></div>
													<ul>
														<ClickableItem
															titleValue=""
															content={ __( 'Enterprise WordPress', __i18n_text_domain__ ) }
															urlValue="https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav"
															type="dropdown"
														/>
													</ul>
												</div>
											</li>
											<li className="x-nav-item x-nav-item__wide" role="none">
												<NonClickableItem
													className="x-nav-link x-link"
													content={ __( 'Features', __i18n_text_domain__ ) }
												/>
												<div
													className="x-dropdown-content"
													data-dropdown-name="features"
													role="menu"
													aria-label={ __( 'Features', __i18n_text_domain__ ) }
													aria-hidden="true"
												>
													<ul>
														<ClickableItem
															titleValue=""
															content={ __( 'Overview', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/features/' ) }
															type="dropdown"
															target="_self"
														/>
													</ul>
													<div className="x-dropdown-content-separator"></div>
													<ul>
														<ClickableItem
															titleValue=""
															content={ __( 'WordPress Themes', __i18n_text_domain__ ) }
															urlValue={ localizeUrl(
																'//wordpress.com/themes',
																locale,
																isLoggedIn,
																true
															) }
															type="dropdown"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'WordPress Plugins', __i18n_text_domain__ ) }
															urlValue={ localizeUrl(
																'//wordpress.com/plugins',
																locale,
																isLoggedIn,
																true
															) }
															type="dropdown"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'WordPress Patterns', __i18n_text_domain__ ) }
															urlValue={ localizeUrl(
																'//wordpress.com/patterns',
																locale,
																isLoggedIn,
																true
															) }
															type="dropdown"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'Google Apps', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/google/' ) }
															type="dropdown"
															target="_self"
														/>
													</ul>
												</div>
											</li>
											<li className="x-nav-item x-nav-item__wide" role="none">
												<NonClickableItem
													className="x-nav-link x-link"
													content={ __( 'Resources', __i18n_text_domain__ ) }
												/>
												<div
													className="x-dropdown-content"
													data-dropdown-name="resources"
													role="menu"
													aria-label={ __( 'Resources', __i18n_text_domain__ ) }
													aria-hidden="true"
												>
													<ul>
														<ClickableItem
															titleValue=""
															content={ __( 'WordPress.com Support', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/support/' ) }
															type="dropdown"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'WordPress News', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/blog/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'Business Name Generator', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/business-name-generator/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'Logo Maker', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/logo-maker/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'Discover New Posts', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/discover' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'Popular Tags', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/tags' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue=""
															content={ __( 'Blog Search', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/reader/search' ) }
															type="dropdown"
															target="_self"
														/>
													</ul>
												</div>
											</li>
											<ClickableItem
												className="x-nav-item x-nav-item__wide"
												titleValue=""
												content={ __( 'Plans & Pricing', __i18n_text_domain__ ) }
												urlValue={ localizeUrl( '//wordpress.com/pricing/' ) }
												type="nav"
												target="_self"
											/>
										</>
									) }
								</ul>
								<ul className="x-nav-list x-nav-list__right" role="menu">
									{ ! isLoggedIn && (
										<ClickableItem
											className="x-nav-item x-nav-item__wide"
											titleValue=""
											content={
												nav2026
													? __( 'Log in', __i18n_text_domain__ )
													: __( 'Log In', __i18n_text_domain__ )
											}
											urlValue={
												loginUrl ||
												localizeUrl( '//wordpress.com/log-in', locale, isLoggedIn, true )
											}
											type="nav"
											onItemMouseEnter={ nav2026 ? () => setActiveDropdown( null ) : undefined }
											onItemFocus={ nav2026 ? () => setActiveDropdown( null ) : undefined }
										/>
									) }
									{ ! hideGetStartedCta && (
										<ClickableItem
											className="x-nav-item x-nav-item__wide"
											titleValue=""
											content={
												nav2026
													? __( 'Get started', __i18n_text_domain__ )
													: __( 'Get Started', __i18n_text_domain__ )
											}
											urlValue={ startUrl }
											type="nav"
											typeClassName="x-nav-link x-nav-link__primary x-link cta-btn-nav"
											onItemMouseEnter={ nav2026 ? () => setActiveDropdown( null ) : undefined }
											onItemFocus={ nav2026 ? () => setActiveDropdown( null ) : undefined }
										/>
									) }
									<li className="x-nav-item x-nav-item__narrow" role="none">
										<button
											ref={ menuTriggerRef }
											type="button"
											role="menuitem"
											className="x-nav-link x-nav-link__menu x-link"
											// The dialog + its id only exist on the 2026 path; legacy has neither.
											aria-haspopup={ nav2026 ? 'dialog' : undefined }
											aria-controls={ nav2026 ? 'x-mobile-menu-2026' : undefined }
											aria-expanded={ isMobileMenuOpen }
											onClick={ nav2026 ? openMobileMenu : openLegacyMobileMenu }
										>
											<span className="x-hidden">{ __( 'Menu', __i18n_text_domain__ ) }</span>
											<svg
												className="x-icon x-icon__menu"
												xmlns="http://www.w3.org/2000/svg"
												width="18"
												height="14"
												viewBox="0 0 18 14"
												role="presentation"
												aria-hidden="true"
												focusable="false"
											>
												<path
													d="M18 13.5H0V12H18V13.5ZM18 7.5H0V6H18V7.5ZM18 1.5H0V0H18V1.5Z"
													fill="currentColor"
												/>
											</svg>
										</button>
									</li>
								</ul>
							</nav>
						</div>
					</div>
					{ /* Blur behind the open dropdown; outside `.masterbar` so the white nav never covers it. */ }
					{ nav2026 && <div className="x-nav-backdrop" aria-hidden="true" /> }
					{ variant !== 'minimal' && nav2026 && (
						<Nav2026DesktopDropdown
							dropdownRef={ dropdownRef }
							activeDropdown={ activeDropdown }
							nav2026Menus={ nav2026Menus }
							onMouseLeave={ () => setActiveDropdown( null ) }
						/>
					) }
					{ /*<!-- Nav bar ends here. -->*/ }

					{ /*<!-- Mobile menu starts here. -->*/ }
					{ /* The 2026 mobile menu renders as a sibling after this container's
					     closing tag, so its overlay can sit above the sticky sub-nav while
					     the nav bar inside the container stays below it. Legacy menu
					     stays here. */ }
					{ ! nav2026 && (
						<div
							className={ isMobileMenuOpen ? 'x-menu x-menu__active x-menu__open' : 'x-menu' }
							role="menu"
							aria-label={ __( 'WordPress.com Navigation Menu', __i18n_text_domain__ ) }
							aria-hidden={ ! isMobileMenuOpen }
						>
							{ /* Click-outside scrim; Escape is handled by the document keydown listener above. */ }
							{ /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */ }
							<div
								className="x-menu-overlay"
								onClick={ () => closeLegacyMobileMenu( 'overlay' ) }
							/>
							<div className="x-menu-content">
								<button
									className="x-menu-button x-link"
									onClick={ () => closeLegacyMobileMenu( 'close_button' ) }
								>
									<span className="x-hidden">
										{ __( 'Close the navigation menu', __i18n_text_domain__ ) }
									</span>
									<span className="x-icon x-icon__close">
										<span></span>
										<span></span>
									</span>
								</button>
								<div className="x-menu-list" aria-hidden={ ! isMobileMenuOpen }>
									<div className="x-menu-list-title">
										{ __( 'Get Started', __i18n_text_domain__ ) }
									</div>
									{ ! isLoggedIn && (
										<ul className="x-menu-grid">
											<ClickableItem
												titleValue=""
												content={
													<>
														{ __( 'Sign Up', __i18n_text_domain__ ) }{ ' ' }
														<span className="x-menu-link-chevron" />
													</>
												}
												urlValue={ startUrl }
												type="menu"
												tabIndex={ mobileMenuTabIndex }
											/>
											<ClickableItem
												titleValue=""
												content={
													<>
														{ __( 'Log In', __i18n_text_domain__ ) }{ ' ' }
														<span className="x-menu-link-chevron" />
													</>
												}
												urlValue={ localizeUrl(
													'//wordpress.com/log-in',
													locale,
													isLoggedIn,
													true
												) }
												type="menu"
												tabIndex={ mobileMenuTabIndex }
											/>
										</ul>
									) }
								</div>
								{ variant !== 'minimal' ? (
									<>
										<div className="x-menu-list" aria-hidden={ ! isMobileMenuOpen }>
											<div className="x-hidden">{ __( 'About', __i18n_text_domain__ ) }</div>
											<ul className="x-menu-grid">
												<ClickableItem
													titleValue=""
													content={ __( 'Plans & Pricing', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/pricing/' ) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
											</ul>
										</div>
										<div className="x-menu-list" aria-hidden={ ! isMobileMenuOpen }>
											<div className="x-menu-list-title">
												{ __( 'Products', __i18n_text_domain__ ) }
											</div>
											<ul className="x-menu-grid">
												<ClickableItem
													titleValue=""
													content={ __( 'WordPress Hosting', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/hosting/' ) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'WordPress for Agencies', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/for-agencies/' ) }
													type="menu"
													target="_self"
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'Become an Affiliate', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/affiliates/' ) }
													type="menu"
													target="_self"
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'Domain Names', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/domains/' ) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'AI Website Builder', __i18n_text_domain__ ) }
													urlValue={ localizeUrl(
														'//wordpress.com/ai-website-builder/?ref=topnav'
													) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'Website Builder', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/website-builder/' ) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'Create a Blog', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/create-blog/' ) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'Newsletter', __i18n_text_domain__ ) }
													urlValue={ localizeUrl(
														'//wordpress.com/newsletter/',
														locale,
														isLoggedIn,
														true
													) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'Professional Email', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/professional-email/' ) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												{ isEnglishLocale && (
													<ClickableItem
														titleValue=""
														content={ __( 'Website Design Services', __i18n_text_domain__ ) }
														urlValue={ localizeUrl( '//wordpress.com/website-design-service/' ) }
														type="menu"
														target="_self"
														tabIndex={ mobileMenuTabIndex }
													/>
												) }
												<ClickableItem
													titleValue=""
													content={ __( 'Commerce', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/ecommerce/' ) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'WordPress Studio', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//developer.wordpress.com/studio/' ) }
													type="menu"
													target="_self"
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'Enterprise', __i18n_text_domain__ ) }
													urlValue="https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav"
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
											</ul>
										</div>
										<div className="x-menu-list" aria-hidden={ ! isMobileMenuOpen }>
											<div className="x-menu-list-title">
												{ __( 'Features', __i18n_text_domain__ ) }
											</div>
											<ul className="x-menu-grid">
												<ClickableItem
													titleValue=""
													content={ __( 'Overview', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/features/' ) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'WordPress Themes', __i18n_text_domain__ ) }
													urlValue={ localizeUrl(
														'//wordpress.com/themes',
														locale,
														isLoggedIn,
														true
													) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'WordPress Plugins', __i18n_text_domain__ ) }
													urlValue={ localizeUrl(
														'//wordpress.com/plugins',
														locale,
														isLoggedIn,
														true
													) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'WordPress Patterns', __i18n_text_domain__ ) }
													urlValue={ localizeUrl(
														'//wordpress.com/patterns',
														locale,
														isLoggedIn,
														true
													) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'Google Apps', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/google/' ) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
											</ul>
										</div>
										<div className="x-menu-list" aria-hidden={ ! isMobileMenuOpen }>
											<div className="x-menu-list-title">
												{ __( 'Resources', __i18n_text_domain__ ) }
											</div>
											<ul className="x-menu-grid">
												<ClickableItem
													titleValue=""
													content={ __( 'WordPress.com Support', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/support/' ) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'News', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/blog/' ) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'Business Name Generator', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/business-name-generator/' ) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'Logo Maker', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/logo-maker/' ) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'Discover New Posts', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/discover' ) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'Popular Tags', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/tags' ) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
												<ClickableItem
													titleValue=""
													content={ __( 'Blog Search', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/reader/search' ) }
													type="menu"
													tabIndex={ mobileMenuTabIndex }
												/>
											</ul>
										</div>
									</>
								) : null }
							</div>
						</div>
					) }
					{ /*<!-- Mobile menu ends here. -->*/ }
				</div>
				{ /* 2026 mobile menu — sibling of the nav container so its overlay/panel
				     stack above the sticky sub-nav (the nav bar inside the container
				     stays below it). */ }
				{ nav2026 && (
					<Nav2026MobileMenu
						isMobileMenuOpen={ isMobileMenuOpen }
						isMenuOpening={ isMenuOpening }
						activeCategory={ activeCategory }
						nav2026Menus={ nav2026Menus }
						isLoggedIn={ isLoggedIn }
						mobileMenuTabIndex={ mobileMenuTabIndex }
						logoColor={ logoColor }
						userAvatar={ userAvatar }
						userName={ userName }
						userEmail={ userEmail }
						localizeUrl={ localizeUrl }
						locale={ locale }
						startUrl={ startUrl }
						loginUrl={ loginUrl }
						__={ __ }
						variant={ variant }
						mobilePlatform={ mobilePlatform }
						mobileFooterRef={ mobileFooterRef }
						closeMobileMenu={ closeMobileMenu }
						setCurrentDropdown={ selectMobileCategory }
					/>
				) }
			</div>
		</div>
	);
};

export default UniversalNavbarHeader;
