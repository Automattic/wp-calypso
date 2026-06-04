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

// 2026 nav taxonomy shape. A top-level entry is either a dropdown (has `groups`)
// or a direct link (has `href`).
interface Nav2026Item {
	label: string;
	url: string;
	target?: string;
	badge?: boolean;
}
interface Nav2026Group {
	title: string;
	items: Nav2026Item[];
}
type Nav2026Menu =
	| { name: string; title: string; groups: Nav2026Group[]; href?: undefined }
	| { name: string; title: string; href: string; groups?: undefined };

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
	// 2026 mobile menu drill-down: which category is currently expanded (null = top level).
	const [ currentDropdown, setCurrentDropdown ] = useState< string | null >( null );
	// 2026 desktop dropdown: which top-level menu is open (null = none). Drives a single
	// persistent panel so switching triggers cross-fades the stacked content (no flash).
	const [ activeDropdown, setActiveDropdown ] = useState< string | null >( null );
	const isEnglishLocale = useIsEnglishLocale();
	// Allow tabbing in mobile version only when the menu is open
	const mobileMenuTabIndex = isMobileMenuOpen ? undefined : -1;

	const closeMobileMenu = () => {
		setMobileMenuOpen( false );
		setCurrentDropdown( null );
	};

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

	// Align the 2026 dropdown content under the first nav item by exposing that
	// item's inline-start offset as a CSS custom property (RTL-aware). The CSS
	// consumes it via `calc()` at >= 1025px; below that the panel uses its own padding.
	useEffect( () => {
		if ( ! nav2026 ) {
			return;
		}

		const updateOffset = () => {
			const nav = document.querySelector< HTMLElement >( '.x-nav--2026-redesign' );
			const firstItem = nav?.querySelector< HTMLElement >( '.x-nav-item__wide .x-nav-link' );
			if ( ! nav || ! firstItem ) {
				return;
			}
			const isRTL = getComputedStyle( nav ).direction === 'rtl';
			const navRect = nav.getBoundingClientRect();
			const itemRect = firstItem.getBoundingClientRect();
			const inlineStart = isRTL ? navRect.right - itemRect.right : itemRect.left - navRect.left;
			nav.style.setProperty(
				'--dropdown-trigger-inline-start',
				`${ Math.round( inlineStart ) }px`
			);
		};

		updateOffset();
		window.addEventListener( 'resize', updateOffset );
		return () => window.removeEventListener( 'resize', updateOffset );
	}, [ nav2026, nav2026Variant ] );

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

	// Shared 2026 sub-structures used by both variants (Features group, Resources
	// dropdown, and the Support/Pricing direct links).
	const nav2026FeatureItems: Nav2026Item[] = [
		{
			label: __( 'Themes', __i18n_text_domain__ ),
			url: localizeUrl( '//wordpress.com/themes', locale, isLoggedIn, true ),
			target: undefined,
		},
		{
			label: __( 'Plugins', __i18n_text_domain__ ),
			url: localizeUrl( '//wordpress.com/plugins', locale, isLoggedIn, true ),
			target: undefined,
		},
		{
			label: __( 'Patterns', __i18n_text_domain__ ),
			url: localizeUrl( '//wordpress.com/patterns', locale, isLoggedIn, true ),
			target: undefined,
		},
		{
			label: __( 'AI features', __i18n_text_domain__ ),
			url: localizeUrl( '//wordpress.com/ai/' ),
			target: '_self',
		},
	];
	const nav2026ResourcesMenu: Nav2026Menu = {
		name: 'resources',
		title: __( 'Resources', __i18n_text_domain__ ),
		groups: [
			{
				title: __( 'Tools & Services', __i18n_text_domain__ ),
				items: [
					{
						label: __( 'Business name generator', __i18n_text_domain__ ),
						url: localizeUrl( '//wordpress.com/business-name-generator/' ),
						target: '_self',
					},
					{
						label: __( 'Logo generator', __i18n_text_domain__ ),
						url: localizeUrl( '//wordpress.com/logo-maker/' ),
						target: '_self',
					},
					{
						label: __( 'Site profiler (WHOIS)', __i18n_text_domain__ ),
						url: localizeUrl( '//wordpress.com/site-profiler' ),
						target: '_self',
					},
					{
						label: __( 'Speed test', __i18n_text_domain__ ),
						url: localizeUrl( '//wordpress.com/speed-test/' ),
						target: '_self',
					},
					{
						label: __( 'Hire an expert', __i18n_text_domain__ ),
						url: localizeUrl( '//wordpress.com/website-design-service/' ),
						target: '_self',
					},
					{
						label: __( 'AI website builder', __i18n_text_domain__ ),
						url: localizeUrl( '//wordpress.com/ai-website-builder/?ref=topnav' ),
						target: '_self',
						badge: true,
					},
				],
			},
			{
				title: __( 'For Developers', __i18n_text_domain__ ),
				items: [
					{
						label: __( 'Developer tools', __i18n_text_domain__ ),
						url: 'https://developer.wordpress.com/docs/developer-tools/',
						target: undefined,
					},
					{
						label: __( 'Developer blog', __i18n_text_domain__ ),
						url: localizeUrl( '//wordpress.com/blog/category/development/' ),
						target: '_self',
					},
					{
						label: __( 'Rest API', __i18n_text_domain__ ),
						url: 'https://developer.wordpress.com/docs/api/',
						target: undefined,
					},
					{
						label: __( 'Docs', __i18n_text_domain__ ),
						url: 'https://developer.wordpress.com/docs/',
						target: undefined,
					},
					{
						label: __( 'Studio', __i18n_text_domain__ ),
						url: localizeUrl( '//developer.wordpress.com/studio/' ),
						target: '_self',
					},
				],
			},
			{
				title: __( 'Features', __i18n_text_domain__ ),
				items: nav2026FeatureItems,
			},
			{
				title: __( 'Discover', __i18n_text_domain__ ),
				items: [
					{
						label: __( 'Latest news', __i18n_text_domain__ ),
						url: localizeUrl( '//wordpress.com/blog/' ),
						target: '_self',
					},
					{
						label: __( 'Browse blogs', __i18n_text_domain__ ),
						url: localizeUrl( '//wordpress.com/discover' ),
						target: '_self',
					},
				],
			},
		],
	};
	const nav2026SupportLink: Nav2026Menu = {
		name: 'support',
		title: __( 'Support', __i18n_text_domain__ ),
		href: localizeUrl( '//wordpress.com/support/' ),
	};
	const nav2026PricingLink: Nav2026Menu = {
		name: 'pricing',
		title: __( 'Pricing', __i18n_text_domain__ ),
		href: localizeUrl( '//wordpress.com/pricing/' ),
	};
	// 2026 nav taxonomies — exact mirror of the shipped Landpack reference
	// (`hp-2024-jul?nav_2026=1` and `?nav_2026=2`). Each top-level menu is either a
	// dropdown (with grouped subcategory columns) or a direct link (no `groups`).
	// Selected by `nav2026Variant`; only used on the `nav2026` path. The flag-OFF
	// nav keeps Calypso's own taxonomy (rendered separately below), unchanged.
	const nav2026Menus: Nav2026Menu[] =
		nav2026Variant === 2
			? [
					{
						name: 'products',
						title: __( 'Products', __i18n_text_domain__ ),
						groups: [
							{
								title: __( 'Build', __i18n_text_domain__ ),
								items: [
									{
										label: __( 'Website', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/website-builder/' ),
										target: '_self',
									},
									{
										label: __( 'Ecommerce', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/ecommerce/' ),
										target: '_self',
									},
									{
										label: __( 'Gravatar (Link in bio)', __i18n_text_domain__ ),
										url: 'https://gravatar.com/link-in-bio',
										target: '_self',
									},
									{
										label: __( 'AI website builder', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/ai-website-builder/?ref=topnav' ),
										target: '_self',
										badge: true,
									},
								],
							},
							{
								title: __( 'Publish', __i18n_text_domain__ ),
								items: [
									{
										label: __( 'Blog', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/create-blog/' ),
										target: '_self',
									},
									{
										label: __( 'Newsletter', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/newsletter/', locale, isLoggedIn, true ),
										target: '_self',
									},
								],
							},
							{
								title: __( 'Hosting', __i18n_text_domain__ ),
								items: [
									{
										label: __( 'Managed hosting', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/hosting/' ),
										target: '_self',
									},
									{
										label: __( 'Agency hosting', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/for-agencies/' ),
										target: '_self',
									},
									{
										label: __( 'Enterprise hosting', __i18n_text_domain__ ),
										url: 'https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav',
										target: undefined,
									},
									{
										label: __( 'Site migration', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/move/' ),
										target: '_self',
									},
									{
										label: __( 'Affiliate program', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/affiliates/' ),
										target: '_self',
									},
								],
							},
							{
								title: __( 'Domains', __i18n_text_domain__ ),
								items: [
									{
										label: __( 'Find a domain', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/domains/' ),
										target: '_self',
									},
									{
										label: __( 'Transfer a domain', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/setup/domain-transfer' ),
										target: '_self',
									},
									{
										label: __( 'Site profiler (WHOIS)', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/site-profiler' ),
										target: '_self',
									},
									{
										label: __( 'Professional email', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/professional-email/' ),
										target: '_self',
									},
								],
							},
						],
					},
					nav2026ResourcesMenu,
					nav2026SupportLink,
					nav2026PricingLink,
			  ]
			: [
					{
						name: 'websites',
						title: __( 'Websites', __i18n_text_domain__ ),
						groups: [
							{
								title: __( 'Build', __i18n_text_domain__ ),
								items: [
									{
										label: __( 'Website', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/website-builder/' ),
										target: '_self',
									},
									{
										label: __( 'Ecommerce', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/ecommerce/' ),
										target: '_self',
									},
									{
										label: __( 'Gravatar (Link in bio)', __i18n_text_domain__ ),
										url: 'https://gravatar.com/link-in-bio',
										target: '_self',
									},
									{
										label: __( 'AI website builder', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/ai-website-builder/?ref=topnav' ),
										target: '_self',
										badge: true,
									},
								],
							},
							{
								title: __( 'Publish', __i18n_text_domain__ ),
								items: [
									{
										label: __( 'Blog', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/create-blog/' ),
										target: '_self',
									},
									{
										label: __( 'Newsletter', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/newsletter/', locale, isLoggedIn, true ),
										target: '_self',
									},
								],
							},
							{
								title: __( 'Features', __i18n_text_domain__ ),
								items: nav2026FeatureItems,
							},
						],
					},
					{
						name: 'hosting',
						title: __( 'Hosting', __i18n_text_domain__ ),
						groups: [
							{
								title: __( 'Hosting', __i18n_text_domain__ ),
								items: [
									{
										label: __( 'Managed hosting', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/hosting/' ),
										target: '_self',
									},
									{
										label: __( 'Agency hosting', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/for-agencies/' ),
										target: '_self',
									},
									{
										label: __( 'Enterprise hosting', __i18n_text_domain__ ),
										url: 'https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav',
										target: undefined,
									},
									{
										label: __( 'Site migration', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/move/' ),
										target: '_self',
									},
								],
							},
							{
								title: __( 'Affiliates', __i18n_text_domain__ ),
								items: [
									{
										label: __( 'Affiliate program', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/affiliates/' ),
										target: '_self',
									},
								],
							},
						],
					},
					{
						name: 'domains',
						title: __( 'Domains', __i18n_text_domain__ ),
						groups: [
							{
								title: __( 'Domains', __i18n_text_domain__ ),
								items: [
									{
										label: __( 'Find a domain', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/domains/' ),
										target: '_self',
									},
									{
										label: __( 'Transfer a domain', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/setup/domain-transfer' ),
										target: '_self',
									},
									{
										label: __( 'Site profiler (WHOIS)', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/site-profiler' ),
										target: '_self',
									},
								],
							},
							{
								title: __( 'Email', __i18n_text_domain__ ),
								items: [
									{
										label: __( 'Professional email', __i18n_text_domain__ ),
										url: localizeUrl( '//wordpress.com/professional-email/' ),
										target: '_self',
									},
								],
							},
						],
					},
					nav2026ResourcesMenu,
					nav2026SupportLink,
					nav2026PricingLink,
			  ];
	const activeCategory = nav2026Menus.find( ( menu ) => menu.name === currentDropdown );

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
					className="lpc-header-nav-container"
					onMouseLeave={ nav2026 ? () => setActiveDropdown( null ) : undefined }
				>
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
									{ variant !== 'minimal' && nav2026 && (
										<>
											{ nav2026Menus.map( ( menu ) =>
												menu.groups ? (
													<li
														className="x-nav-item x-nav-item__wide"
														role="none"
														key={ menu.name }
														onMouseEnter={ () => setActiveDropdown( menu.name ) }
														onFocus={ () => setActiveDropdown( menu.name ) }
													>
														<NonClickableItem
															className="x-nav-link x-link"
															content={ menu.title }
															ariaExpanded={ activeDropdown === menu.name }
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
						</div>
					</div>
					{ /* Full-viewport blur behind the open dropdown. Outside `.masterbar` so the
					     open-state white nav background never sits over it. */ }
					{ nav2026 && <div className="x-nav-backdrop" aria-hidden="true" /> }
					{ /* 2026 desktop dropdown — ONE persistent panel holding all menus' content
					     stacked; the active one (activeDropdown) cross-fades in while the others fade out,
					     so switching triggers never blanks the panel. Hovering the panel keeps it
					     open; leaving the nav area closes it. */ }
					{ variant !== 'minimal' && nav2026 && (
						<div className="x-dropdown x-dropdown--2026">
							{ nav2026Menus.map( ( menu ) =>
								menu.groups ? (
									<div
										className="x-dropdown-content x-dropdown--2026"
										data-dropdown-name={ menu.name }
										role="menu"
										aria-label={ menu.title }
										aria-hidden={ activeDropdown !== menu.name }
										key={ menu.name }
									>
										<div className="x-dropdown-subcategories">
											{ menu.groups.map( ( group ) => (
												<div className="x-dropdown-column-group" key={ group.title }>
													<h4 className="x-dropdown-subcategory-title">{ group.title }</h4>
													<ul>
														{ group.items.map( ( item ) => (
															<ClickableItem
																key={ item.url }
																titleValue=""
																content={
																	item.badge ? (
																		<>
																			{ item.label }{ ' ' }
																			<span className="x-dropdown-badge-new">
																				{ __( 'New', __i18n_text_domain__ ) }
																			</span>
																		</>
																	) : (
																		item.label
																	)
																}
																urlValue={ item.url }
																type="dropdown"
																target={ item.target }
																tabIndex={ activeDropdown === menu.name ? undefined : -1 }
															/>
														) ) }
													</ul>
												</div>
											) ) }
										</div>
									</div>
								) : null
							) }
						</div>
					) }
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
									{ activeCategory && activeCategory.groups ? (
										<div
											className="x-menu-mobile-dropdown"
											data-dropdown-name={ activeCategory.name }
										>
											{ activeCategory.groups.map( ( group, groupIndex ) => (
												<ul className="x-menu-mobile-dropdown-list" key={ group.title }>
													<li className="x-menu-mobile-dropdown-subtitle" role="presentation">
														{ group.title }
													</li>
													{ group.items.map( ( item, itemIndex ) => (
														<li
															className="x-menu-mobile-dropdown-item"
															role="none"
															key={ item.url }
															style={
																{
																	'--stagger-index': groupIndex * 4 + itemIndex,
																} as React.CSSProperties
															}
														>
															<ClickableItem
																titleValue=""
																content={
																	item.badge ? (
																		<>
																			{ item.label }{ ' ' }
																			<span className="x-dropdown-badge-new">
																				{ __( 'New', __i18n_text_domain__ ) }
																			</span>
																		</>
																	) : (
																		item.label
																	)
																}
																urlValue={ item.url }
																type="menu"
																typeClassName="x-menu-mobile-dropdown-link x-link"
																target={ item.target }
																tabIndex={ mobileMenuTabIndex }
															/>
														</li>
													) ) }
												</ul>
											) ) }
										</div>
									) : (
										variant !== 'minimal' && (
											<ul className="x-menu-mobile-nav-list">
												{ nav2026Menus.map( ( menu, index ) => (
													<li
														className="x-menu-mobile-nav-item"
														role="none"
														key={ menu.name }
														style={ { '--stagger-index': index } as React.CSSProperties }
													>
														{ menu.groups ? (
															<button
																className="x-menu-mobile-nav-link x-link"
																onClick={ () => setCurrentDropdown( menu.name ) }
																tabIndex={ mobileMenuTabIndex }
															>
																{ menu.title }
																<span className="x-menu-mobile-nav-chevron" aria-hidden="true" />
															</button>
														) : (
															<ClickableItem
																titleValue=""
																content={ menu.title }
																urlValue={ menu.href }
																type="menu"
																typeClassName="x-menu-mobile-nav-link x-link"
																tabIndex={ mobileMenuTabIndex }
															/>
														) }
													</li>
												) ) }
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
