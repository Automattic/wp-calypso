/* eslint-disable no-restricted-imports */
import { WordPressWordmark } from '@automattic/components';
import { useLocalizeUrl, useIsEnglishLocale, useLocale } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { HeaderProps } from '../types';
import { NonClickableItem, ClickableItem } from './menu-items';
import './style.scss';

// Mystery-person Gravatar, used as the 2026 mobile footer avatar fallback.
const DEFAULT_AVATAR_URL = 'https://www.gravatar.com/avatar/?d=mp&s=96';

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
	userAvatar,
	userName,
	userEmail,
}: HeaderProps ) => {
	const locale = useLocale();
	const localizeUrl = useLocalizeUrl();
	const { __ } = useI18n();
	const [ isMobileMenuOpen, setMobileMenuOpen ] = useState( false );
	// 2026 mobile menu drill-down: which category is currently expanded (null = top level).
	const [ currentDropdown, setCurrentDropdown ] = useState< string | null >( null );
	const isEnglishLocale = useIsEnglishLocale();
	// Allow tabbing in mobile version only when the menu is open
	const mobileMenuTabIndex = isMobileMenuOpen ? undefined : -1;

	const closeMobileMenu = () => {
		setMobileMenuOpen( false );
		setCurrentDropdown( null );
	};

	// 2026 redesign: align the full-width dropdown content under its trigger by
	// exposing the trigger's inline-start offset as a CSS custom property. This
	// replaces Landpack's vanilla `dropdown.js` offset() math.
	useEffect( () => {
		if ( ! nav2026 ) {
			return;
		}

		const setTriggerOffset = ( event: Event ) => {
			const target = event.target;
			if ( ! ( target instanceof HTMLElement ) ) {
				return;
			}
			const navItem = target.closest( '.x-nav-item__wide' );
			const dropdown = navItem?.querySelector< HTMLElement >( '.x-dropdown-content' );
			const trigger = navItem?.querySelector< HTMLElement >( '.x-nav-link' );
			if ( ! dropdown || ! trigger ) {
				return;
			}
			const isRTL = getComputedStyle( trigger ).direction === 'rtl';
			const rect = trigger.getBoundingClientRect();
			const inlineStart = isRTL ? window.innerWidth - rect.right : rect.left;
			dropdown.style.setProperty( '--dropdown-trigger-inline-start', `${ inlineStart }px` );
		};

		document.addEventListener( 'focusin', setTriggerOffset );
		document.addEventListener( 'mouseenter', setTriggerOffset, true );

		return () => {
			document.removeEventListener( 'focusin', setTriggerOffset );
			document.removeEventListener( 'mouseenter', setTriggerOffset, true );
		};
	}, [ nav2026 ] );

	// Handle dropdown management to ensure only one is open at a time
	useEffect( () => {
		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
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
	}, [] );

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

	// Taxonomy that drives the 2026 mobile drill-down menu. Mirrors the desktop
	// dropdown taxonomy above; only built/rendered on the 2026 path.
	const mobileMenuCategories = [
		{
			name: 'products',
			title: __( 'Products', __i18n_text_domain__ ),
			items: [
				{
					content: __( 'WordPress Hosting', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/hosting/' ),
					target: '_self',
				},
				{
					content: __( 'WordPress for Agencies', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/for-agencies/' ),
					target: '_self',
				},
				{
					content: __( 'Become an Affiliate', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/affiliates/' ),
					target: '_self',
				},
				{
					content: __( 'Domain Names', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/domains/' ),
					target: '_self',
				},
				{
					content: __( 'AI Website Builder', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/ai-website-builder/?ref=topnav' ),
					target: '_self',
				},
				{
					content: __( 'Website Builder', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/website-builder/' ),
					target: '_self',
				},
				{
					content: __( 'Create a Blog', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/create-blog/' ),
					target: '_self',
				},
				{
					content: __( 'Newsletter', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/newsletter/', locale, isLoggedIn, true ),
					target: '_self',
				},
				{
					content: __( 'Professional Email', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/professional-email/' ),
					target: '_self',
				},
				...( isEnglishLocale
					? [
							{
								content: __( 'Website Design Services', __i18n_text_domain__ ),
								url: localizeUrl( '//wordpress.com/website-design-service/' ),
								target: '_self',
							},
					  ]
					: [] ),
				{
					content: __( 'Commerce', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/ecommerce/' ),
					target: '_self',
				},
				{
					content: __( 'WordPress Studio', __i18n_text_domain__ ),
					url: localizeUrl( '//developer.wordpress.com/studio/' ),
					target: '_self',
				},
				{
					content: __( 'Enterprise WordPress', __i18n_text_domain__ ),
					url: 'https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav',
					target: undefined,
				},
			],
		},
		{
			name: 'features',
			title: __( 'Features', __i18n_text_domain__ ),
			items: [
				{
					content: __( 'Overview', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/features/' ),
					target: '_self',
				},
				{
					content: __( 'WordPress Themes', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/themes', locale, isLoggedIn, true ),
					target: undefined,
				},
				{
					content: __( 'WordPress Plugins', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/plugins', locale, isLoggedIn, true ),
					target: undefined,
				},
				{
					content: __( 'WordPress Patterns', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/patterns', locale, isLoggedIn, true ),
					target: undefined,
				},
				{
					content: __( 'Google Apps', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/google/' ),
					target: '_self',
				},
			],
		},
		{
			name: 'resources',
			title: __( 'Resources', __i18n_text_domain__ ),
			items: [
				{
					content: __( 'WordPress.com Support', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/support/' ),
					target: undefined,
				},
				{
					content: __( 'WordPress News', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/blog/' ),
					target: '_self',
				},
				{
					content: __( 'Business Name Generator', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/business-name-generator/' ),
					target: '_self',
				},
				{
					content: __( 'Logo Maker', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/logo-maker/' ),
					target: '_self',
				},
				{
					content: __( 'Discover New Posts', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/discover' ),
					target: '_self',
				},
				{
					content: __( 'Popular Tags', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/tags' ),
					target: '_self',
				},
				{
					content: __( 'Blog Search', __i18n_text_domain__ ),
					url: localizeUrl( '//wordpress.com/reader/search' ),
					target: '_self',
				},
			],
		},
	];
	const activeCategory = mobileMenuCategories.find( ( { name } ) => name === currentDropdown );

	return (
		<div
			className={ clsx( className, {
				'is-themes-dark-mode-monochrome':
					isLoggedIn && ( sectionName === 'themes' || sectionName === 'theme' ),
			} ) }
		>
			<div className="x-root lpc-header-nav-wrapper">
				<div className="lpc-header-nav-container">
					{ /*<!-- Nav bar starts here. -->*/ }
					<div className="masterbar-menu">
						<div className="masterbar">
							<nav
								className={ clsx( 'x-nav', { 'x-nav--2026-redesign': nav2026 } ) }
								aria-label="WordPress.com"
							>
								<ul className="x-nav-list x-nav-list__left" role="menu">
									<li className="x-nav-item" role="none">
										<a
											role="menuitem"
											className="x-nav-link x-nav-link__logo x-link"
											href={ localizeUrl( '//wordpress.com' ) }
											target="_self"
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
									{ variant !== 'minimal' ? (
										<>
											<li className="x-nav-item x-nav-item__wide" role="none">
												<NonClickableItem
													className="x-nav-link x-link"
													content={ __( 'Products', __i18n_text_domain__ ) }
												/>
												<div
													className={ clsx( 'x-dropdown-content', {
														'x-dropdown--2026': nav2026,
													} ) }
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
													className={ clsx( 'x-dropdown-content', {
														'x-dropdown--2026': nav2026,
													} ) }
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
													className={ clsx( 'x-dropdown-content', {
														'x-dropdown--2026': nav2026,
													} ) }
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
									) : null }
								</ul>
								<ul className="x-nav-list x-nav-list__right" role="menu">
									{ ! isLoggedIn && (
										<ClickableItem
											className="x-nav-item x-nav-item__wide"
											titleValue=""
											content={ __( 'Log In', __i18n_text_domain__ ) }
											urlValue={
												loginUrl ||
												localizeUrl( '//wordpress.com/log-in', locale, isLoggedIn, true )
											}
											type="nav"
										/>
									) }
									{ ! hideGetStartedCta && (
										<ClickableItem
											className="x-nav-item x-nav-item__wide"
											titleValue=""
											content={ __( 'Get Started', __i18n_text_domain__ ) }
											urlValue={ startUrl }
											type="nav"
											typeClassName="x-nav-link x-nav-link__primary x-link cta-btn-nav"
										/>
									) }
									<li className="x-nav-item x-nav-item__narrow" role="none">
										<button
											role="menuitem"
											className="x-nav-link x-nav-link__menu x-link"
											aria-haspopup="true"
											aria-expanded={ isMobileMenuOpen }
											onClick={ () => setMobileMenuOpen( true ) }
										>
											<span className="x-hidden">{ __( 'Menu', __i18n_text_domain__ ) }</span>
											<span className="x-icon x-icon__menu">
												<span></span>
												<span></span>
												<span></span>
											</span>
										</button>
									</li>
								</ul>
							</nav>
							{ /* 2026 redesign: full-viewport blur behind the open desktop dropdown. */ }
							{ nav2026 && <div className="x-nav-backdrop" aria-hidden="true" /> }
						</div>
					</div>
					{ /*<!-- Nav bar ends here. -->*/ }

					{ /*<!-- Mobile menu starts here. -->*/ }
					{ nav2026 ? (
						<div
							className={
								isMobileMenuOpen
									? 'x-menu x-menu--2026 x-menu__active x-menu__open'
									: 'x-menu x-menu--2026'
							}
							role="menu"
							aria-label={ __( 'WordPress.com Navigation Menu', __i18n_text_domain__ ) }
							aria-hidden={ ! isMobileMenuOpen }
						>
							{ /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */ }
							<div
								className="x-menu-overlay"
								onKeyDown={ closeMobileMenu }
								onClick={ closeMobileMenu }
							/>
							<div className="x-menu-content">
								<div className="x-menu-mobile-header">
									{ activeCategory ? (
										<button
											className="x-menu-mobile-back x-link"
											onClick={ () => setCurrentDropdown( null ) }
										>
											<span className="x-menu-mobile-back-chevron" aria-hidden="true" />
											{ __( 'Back', __i18n_text_domain__ ) }
										</button>
									) : (
										<a
											className="x-menu-mobile-logo x-link"
											href={ localizeUrl( '//wordpress.com' ) }
											target="_self"
										>
											<WordPressWordmark
												className="x-icon x-icon__logo"
												color={ logoColor ?? 'var(--studio-blue-50)' }
												size={ { width: 170, height: 36 } }
											/>
											<span className="x-hidden">WordPress.com</span>
										</a>
									) }
									<button
										className="x-menu-button x-menu-mobile-close x-link"
										onClick={ closeMobileMenu }
									>
										<span className="x-hidden">{ __( 'Close menu', __i18n_text_domain__ ) }</span>
										<span className="x-icon x-icon__close">
											<span></span>
											<span></span>
										</span>
									</button>
								</div>
								<div className="x-menu-mobile-main" aria-hidden={ ! isMobileMenuOpen }>
									{ activeCategory ? (
										<ul className="x-menu-mobile-items" data-dropdown-name={ activeCategory.name }>
											{ activeCategory.items.map( ( item ) => (
												<ClickableItem
													key={ item.url }
													titleValue=""
													content={ item.content }
													urlValue={ item.url }
													type="menu"
													target={ item.target }
													tabIndex={ mobileMenuTabIndex }
												/>
											) ) }
										</ul>
									) : (
										variant !== 'minimal' && (
											<ul className="x-menu-mobile-categories">
												{ mobileMenuCategories.map( ( category ) => (
													<li className="x-menu-mobile-category" role="none" key={ category.name }>
														<button
															className="x-menu-mobile-category-button x-link"
															onClick={ () => setCurrentDropdown( category.name ) }
															tabIndex={ mobileMenuTabIndex }
														>
															{ category.title }
															<span className="x-menu-mobile-category-chevron" aria-hidden="true" />
														</button>
													</li>
												) ) }
												<ClickableItem
													titleValue=""
													content={ __( 'Plans & Pricing', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/pricing/' ) }
													type="menu"
													className="x-menu-mobile-category"
													tabIndex={ mobileMenuTabIndex }
												/>
											</ul>
										)
									) }
								</div>
								<div className="x-menu-mobile-footer">
									{ isLoggedIn ? (
										<a
											className="x-menu-mobile-user x-link"
											href={ localizeUrl( '//wordpress.com/me' ) }
											target="_self"
										>
											<img
												className="x-menu-mobile-user-avatar"
												src={ userAvatar || DEFAULT_AVATAR_URL }
												alt=""
												width={ 40 }
												height={ 40 }
											/>
											<span className="x-menu-mobile-user-details">
												<span className="x-menu-mobile-user-name">
													{ userName || __( 'My Profile', __i18n_text_domain__ ) }
												</span>
												{ userEmail && (
													<span className="x-menu-mobile-user-email">{ userEmail }</span>
												) }
											</span>
										</a>
									) : (
										<ul className="x-menu-mobile-footer-actions">
											<ClickableItem
												titleValue=""
												content={ __( 'Log in', __i18n_text_domain__ ) }
												urlValue={
													loginUrl ||
													localizeUrl( '//wordpress.com/log-in', locale, isLoggedIn, true )
												}
												type="menu"
												typeClassName="x-menu-link x-link x-menu-mobile-login"
												tabIndex={ mobileMenuTabIndex }
											/>
											<ClickableItem
												titleValue=""
												content={ __( 'Get started', __i18n_text_domain__ ) }
												urlValue={ startUrl }
												type="menu"
												typeClassName="x-menu-link x-link x-menu-mobile-get-started cta-btn-nav"
												tabIndex={ mobileMenuTabIndex }
											/>
										</ul>
									) }
								</div>
							</div>
						</div>
					) : (
						<div
							className={ isMobileMenuOpen ? 'x-menu x-menu__active x-menu__open' : 'x-menu' }
							role="menu"
							aria-label={ __( 'WordPress.com Navigation Menu', __i18n_text_domain__ ) }
							aria-hidden={ ! isMobileMenuOpen }
						>
							{ /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */ }
							<div
								className="x-menu-overlay"
								onKeyDown={ () => setMobileMenuOpen( false ) }
								onClick={ () => setMobileMenuOpen( false ) }
							/>
							<div className="x-menu-content">
								<button
									className="x-menu-button x-link"
									onClick={ () => setMobileMenuOpen( false ) }
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
			</div>
		</div>
	);
};

export default UniversalNavbarHeader;
