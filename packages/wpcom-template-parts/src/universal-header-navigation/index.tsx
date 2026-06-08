/* eslint-disable no-restricted-imports */
import { WordPressWordmark } from '@automattic/components';
import { useLocalizeUrl, useIsEnglishLocale, useLocale } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { HeaderProps } from '../types';
import { NonClickableItem, ClickableItem } from './menu-items';
import './style.scss';

// `useLayoutEffect` warns (and is a no-op) during SSR; fall back to `useEffect` on the
// server. Mirrors the same guard in the sibling `universal-footer-navigation` component.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

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
	// 2026 mobile "Get Jetpack app" banner: which device the visitor is on, so we show the
	// matching store glyph (App Store on iOS, Google Play on Android). `null` on desktop /
	// unknown UA, where the banner stays hidden. Set in an effect so SSR renders nothing
	// platform-specific (`navigator` is client-only). The wpcom reference detects this
	// server-side via `is-ios-platform`/`is-android-platform` body classes, which Calypso
	// (a client SPA) doesn't have — so we sniff the UA here instead.
	const [ mobilePlatform, setMobilePlatform ] = useState< 'ios' | 'android' | null >( null );
	// One-shot "panel is opening" phase. While true, the header (logo/close) and footer use
	// their long, panel-synced reveal delay (first open); cleared after the panel settles so
	// later drill/BACK swaps use the quick fade. Mirrors the reference's `is-opening` marker.
	const [ isMenuOpening, setIsMenuOpening ] = useState( false );
	// Measured footer height, published as a CSS var so the scroller's bottom padding clears
	// the absolutely-positioned (overlaid) footer. Height varies with banner/auth/safe-area.
	const mobileFooterRef = useRef< HTMLDivElement >( null );
	// The hamburger button, so closing the 2026 mobile menu can return focus to it
	// instead of dropping focus to <body>.
	const menuTriggerRef = useRef< HTMLButtonElement >( null );
	// 2026 desktop nav: true once the page has scrolled past a small threshold. The nav is
	// `position: fixed` and transparent over the hero at the top; when scrolled it switches to
	// the white surface (same treatment as an open dropdown), driven by the `is-scrolled` class.
	const [ isScrolled, setIsScrolled ] = useState( false );
	// 2026 desktop dropdown: the persistent panel wrapper, plus the bookkeeping for the
	// height FLIP that eases the panel's height when switching between menus. `prevDropdown`
	// distinguishes first-open from switch; `prevHeight` is the pre-switch height (captured in
	// the effect's cleanup, before React commits the new active block), used as the FLIP `from`.
	const dropdownRef = useRef< HTMLDivElement >( null );
	const prevDropdownRef = useRef< string | null >( null );
	const prevHeightRef = useRef< number >( 0 );
	const isEnglishLocale = useIsEnglishLocale();
	// Allow tabbing in mobile version only when the menu is open
	const mobileMenuTabIndex = isMobileMenuOpen ? undefined : -1;

	const closeMobileMenu = useCallback( () => {
		setMobileMenuOpen( false );
		setCurrentDropdown( null );
		// Return focus to the trigger so keyboard/screen-reader users aren't dropped to <body>.
		menuTriggerRef.current?.focus();
	}, [] );

	// Handle dropdown management to ensure only one is open at a time
	useEffect( () => {
		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				// 2026 desktop dropdown is React-state-driven; closing it requires clearing the
				// state (blurring alone leaves the panel open). Return focus to the open trigger.
				setActiveDropdown( ( open ) => {
					if ( open !== null ) {
						const trigger = document.querySelector< HTMLElement >(
							'.x-nav-item__wide [aria-expanded="true"]'
						);
						trigger?.focus();
					}
					return null;
				} );

				// Also dismiss the 2026 mobile menu/dialog and return focus to its trigger.
				setMobileMenuOpen( ( open ) => {
					if ( open ) {
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
	}, [] );

	// 2026 mobile app banner: detect iOS / Android from the User-Agent so the banner
	// shows the matching store glyph (and stays hidden on desktop). Mirrors the
	// reference's `sh_get_platform()` precedence (iPhone/iPad/iPod first, then Android)
	// and Calypso's own checks in `client/blocks/app-banner` — inlined here because the
	// package can't import from `client/`.
	useEffect( () => {
		if ( ! nav2026 ) {
			return;
		}
		const ua = navigator.userAgent || '';
		if ( /iPad|iPhone|iPod/i.test( ua ) ) {
			setMobilePlatform( 'ios' );
		} else if ( /Android/i.test( ua ) ) {
			setMobilePlatform( 'android' );
		}
	}, [ nav2026 ] );

	// 2026 mobile menu open phase: mark `is-opening` while the panel slides in so the
	// header/footer use their delayed reveal once; clear it after the panel settles so
	// subsequent drill/BACK swaps use the quick fade. Mirrors the reference's
	// OPENING_PHASE_MS (~1100ms = panel slide 0.34 + reveal delay 0.43 + fade 0.3).
	useEffect( () => {
		if ( ! nav2026 || ! isMobileMenuOpen ) {
			setIsMenuOpening( false );
			return;
		}
		setIsMenuOpening( true );
		const timer = setTimeout( () => setIsMenuOpening( false ), 1100 );
		return () => clearTimeout( timer );
	}, [ nav2026, isMobileMenuOpen ] );

	// Publish the mobile footer's measured height as a CSS var so the scroller can pad its
	// bottom by exactly that much (the footer is absolutely positioned / overlaid, so the
	// last nav item would otherwise sit behind it). Height varies with the app banner,
	// auth state, and the iOS safe-area inset — a ResizeObserver keeps the var in sync.
	useEffect( () => {
		if ( ! nav2026 || typeof ResizeObserver === 'undefined' ) {
			return;
		}
		const footer = mobileFooterRef.current;
		if ( ! footer ) {
			return;
		}
		// Set the var on `.x-menu-content` (a common ancestor) so the scroller
		// `.x-menu-mobile-main` inherits it — CSS custom props flow down, not up.
		const host = footer.closest< HTMLElement >( '.x-menu-content' ) ?? footer;
		const sync = () => {
			if ( footer.offsetHeight ) {
				host.style.setProperty( '--x-menu-2026-footer-height', `${ footer.offsetHeight }px` );
			}
		};
		const observer = new ResizeObserver( sync );
		observer.observe( footer );
		sync();
		return () => observer.disconnect();
	}, [ nav2026, isMobileMenuOpen, isLoggedIn, mobilePlatform ] );

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
			// The dropdown panel is a SIBLING of the nav (not a descendant), so the var must
			// live on a common ancestor to reach it — set it on `.lpc-header-nav-container`,
			// which wraps both the nav and the dropdown.
			const host = nav?.closest< HTMLElement >( '.lpc-header-nav-container' );
			if ( ! nav || ! firstItem || ! host ) {
				return;
			}
			const isRTL = getComputedStyle( nav ).direction === 'rtl';
			const hostRect = host.getBoundingClientRect();
			const itemRect = firstItem.getBoundingClientRect();
			// Offset of the first nav item from the container edge, so the dropdown's first
			// column lines up under it (RTL-aware).
			const inlineStart = isRTL ? hostRect.right - itemRect.right : itemRect.left - hostRect.left;
			host.style.setProperty(
				'--dropdown-trigger-inline-start',
				`${ Math.round( inlineStart ) }px`
			);
		};

		updateOffset();
		window.addEventListener( 'resize', updateOffset );
		return () => window.removeEventListener( 'resize', updateOffset );
	}, [ nav2026, nav2026Variant ] );

	// 2026 desktop nav scroll state: toggle `is-scrolled` once the page scrolls past a small
	// threshold so the fixed nav switches from transparent to the white surface. Throttled via
	// rAF (one read per frame) and only updates state on an actual boolean change. Reads the
	// initial scroll position on mount so a refresh / deep-link mid-page starts in the right state.
	useEffect( () => {
		if ( ! nav2026 ) {
			return;
		}
		// Trigger as soon as the page leaves the very top, so the white surface appears
		// the moment the hero starts sliding under the fixed nav (no perceptible delay).
		const SCROLL_THRESHOLD = 0;
		let frame = 0;
		const evaluate = () => {
			frame = 0;
			setIsScrolled( ( prev ) => {
				const next = window.scrollY > SCROLL_THRESHOLD;
				return next === prev ? prev : next;
			} );
		};
		const onScroll = () => {
			if ( ! frame ) {
				frame = window.requestAnimationFrame( evaluate );
			}
		};
		evaluate();
		window.addEventListener( 'scroll', onScroll, { passive: true } );
		return () => {
			window.removeEventListener( 'scroll', onScroll );
			if ( frame ) {
				window.cancelAnimationFrame( frame );
			}
		};
	}, [ nav2026 ] );

	// 2026 desktop dropdown open/switch behaviour. The panel stays open while moving between
	// triggers; on a switch its height eases from the old menu's content to the new one via a
	// FLIP (measure → pin old px height → reflow → set new px height → release to auto on
	// transitionend). `is-dropdown-first-open` marks the closed→open case so the items wait for
	// the panel to grow before sliding in; on a switch they use the short stagger instead.
	// useLayoutEffect so the measure/pin happens before paint (no flash of the auto height);
	// the isomorphic variant degrades to useEffect under SSR (no `window`).
	useIsomorphicLayoutEffect( () => {
		if ( ! nav2026 || typeof window === 'undefined' ) {
			return;
		}
		const el = dropdownRef.current;
		const prev = prevDropdownRef.current;
		const next = activeDropdown;
		prevDropdownRef.current = next;
		if ( ! el ) {
			return;
		}
		// The height morph is desktop-only (below 1025 the wide triggers / dropdown are hidden).
		if ( window.matchMedia( '( max-width: 1024px )' ).matches ) {
			return;
		}

		// Closed → open: let the panel grow via CSS; flag the unroll so items wait for it. Drop
		// the flag after the morph so a later switch uses the short stagger.
		if ( prev === null && next !== null ) {
			el.classList.add( 'is-dropdown-first-open' );
			const durMs = parseFloat( getComputedStyle( el ).transitionDuration ) * 1000 || 280;
			const timer = setTimeout( () => el.classList.remove( 'is-dropdown-first-open' ), durMs + 50 );
			return () => {
				clearTimeout( timer );
				// Stash the current height so the next switch FLIPs from the right `from`.
				prevHeightRef.current = el.offsetHeight;
			};
		}

		// Open → closed: nothing to morph; clear the first-open marker.
		if ( prev !== null && next === null ) {
			el.classList.remove( 'is-dropdown-first-open' );
			return;
		}

		// Open → open (switch): FLIP the wrapper height between the two menus' content.
		if ( prev !== null && next !== null && prev !== next ) {
			el.classList.remove( 'is-dropdown-first-open' );
			// Honor reduced-motion: snap to the new height instead of animating it.
			if ( window.matchMedia( '( prefers-reduced-motion: reduce )' ).matches ) {
				return () => {
					prevHeightRef.current = el.offsetHeight;
				};
			}
			const from = prevHeightRef.current;
			const to = el.offsetHeight;
			if ( ! from || from === to ) {
				return () => {
					prevHeightRef.current = el.offsetHeight;
				};
			}
			// Non-null alias so the listener/cleanup closures keep `el`'s narrowing.
			const node = el;
			node.style.overflow = 'hidden';
			node.style.height = `${ from }px`;
			void node.offsetHeight; // force reflow so the next height change transitions
			node.style.height = `${ to }px`;
			// `release` snaps the wrapper back to auto height after the morph. It's idempotent
			// (the `released` guard), so whichever of the transitionend listener or the fallback
			// timer fires first wins and the other is a harmless no-op.
			let released = false;
			// AbortController detaches the listener without naming it — avoids `{ once: true }`,
			// whose stale one-shot handler would otherwise fire on the *next* morph's
			// transitionend if this element is still transitioning when a new switch starts,
			// releasing it prematurely.
			const listenerAbort = new AbortController();
			const release = () => {
				if ( released ) {
					return;
				}
				released = true;
				listenerAbort.abort();
				node.style.height = '';
				node.style.overflow = '';
			};
			node.addEventListener(
				'transitionend',
				( e: TransitionEvent ) => {
					if ( e.target === node && e.propertyName === 'height' ) {
						release();
					}
				},
				{ signal: listenerAbort.signal }
			);
			const durMs = parseFloat( getComputedStyle( node ).transitionDuration ) * 1000 || 280;
			const fallback = window.setTimeout( release, durMs + 50 );
			return () => {
				// Released early if the dropdown changes mid-morph; capture height for the next FLIP.
				clearTimeout( fallback );
				release();
				prevHeightRef.current = node.offsetHeight;
			};
		}

		return () => {
			prevHeightRef.current = el.offsetHeight;
		};
	}, [ nav2026, activeDropdown ] );

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

	// 2026 "Get Jetpack app" mobile banner. Rendered only on iOS / Android (the whole
	// banner is the link; the Download chip is decorative), showing the store glyph that
	// matches the device. Ported from the wpcom Landpack reference; `null` on desktop /
	// unknown UA, where this returns nothing.
	const renderAppBanner = () => {
		if ( ! mobilePlatform ) {
			return null;
		}
		return (
			<a
				className={ clsx(
					'x-menu-mobile-app-banner',
					`x-menu-mobile-app-banner--${ mobilePlatform }`
				) }
				href={ localizeUrl( '//apps.wordpress.com/get/?campaign=wpcom-log-out-home-global-nav' ) }
				aria-label={ __( 'Get the Jetpack app', __i18n_text_domain__ ) }
				tabIndex={ mobileMenuTabIndex }
			>
				<span className="x-menu-mobile-app-banner-icons" aria-hidden="true">
					<svg
						className="x-menu-mobile-app-banner-icon x-menu-mobile-app-banner-icon--wp"
						viewBox="0 0 32 32"
						role="presentation"
						focusable="false"
					>
						<circle cx="16" cy="16" r="16" fill="#3858e9" />
						<path
							fill="#fff"
							d="M5.5 16a10.5 10.5 0 0 0 5.92 9.45L6.41 11.7A10.46 10.46 0 0 0 5.5 16Zm17.59-.53c0-1.3-.47-2.2-.87-2.9-.53-.87-1.03-1.6-1.03-2.47 0-.97.73-1.87 1.77-1.87h.14A10.5 10.5 0 0 0 7.93 10.1h.67c1.1 0 2.8-.13 2.8-.13.57-.04.63.8.07.87 0 0-.57.07-1.2.1l3.83 11.4 2.3-6.9-1.64-4.5c-.57-.03-1.1-.1-1.1-.1-.57-.03-.5-.9.06-.87 0 0 1.73.13 2.77.13 1.1 0 2.8-.13 2.8-.13.57-.04.64.8.07.87 0 0-.57.07-1.2.1l3.8 11.31 1.05-3.5c.46-1.46.8-2.5.8-3.4Zm-6.9 1.45-3.16 9.18a10.5 10.5 0 0 0 6.46-.17 1 1 0 0 1-.07-.16l-3.23-8.85Zm8.74-5.76c.04.34.07.7.07 1.1 0 1.07-.2 2.28-.8 3.79l-3.24 9.36A10.5 10.5 0 0 0 24.93 11.16Z"
						/>
					</svg>
					<svg
						className="x-menu-mobile-app-banner-icon x-menu-mobile-app-banner-icon--jetpack"
						viewBox="0 0 32 32"
						role="presentation"
						focusable="false"
					>
						<path
							fill="#069e08"
							d="M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z M15,19H7l8-16V19z M17,29V13h8L17,29z"
						/>
					</svg>
				</span>
				<span className="x-menu-mobile-app-banner-text">
					<span className="x-menu-mobile-app-banner-title">
						{ __( 'Get Jetpack app', __i18n_text_domain__ ) }
					</span>
					<span className="x-menu-mobile-app-banner-subtitle">
						{ __( 'Manage your site on mobile', __i18n_text_domain__ ) }
					</span>
				</span>
				<span className="x-menu-mobile-app-banner-download">
					{ mobilePlatform === 'ios' && (
						<svg
							className="x-menu-mobile-app-banner-store-icon x-menu-mobile-app-banner-store-icon--apple"
							viewBox="0 0 16 20"
							role="presentation"
							focusable="false"
							aria-hidden="true"
						>
							<path
								fill="currentColor"
								d="M13.27 10.62c-.02-2.02 1.65-2.99 1.72-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.3 2-1.4 2.44-.36 6.05 1 8.03.66.97 1.45 2.06 2.49 2.02 1-.04 1.38-.65 2.59-.65 1.21 0 1.55.65 2.6.63 1.07-.02 1.75-.99 2.41-1.96.76-1.12 1.07-2.21 1.09-2.27-.02-.01-2.09-.8-2.11-3.18ZM11.26 4.7c.55-.67.92-1.6.82-2.53-.79.03-1.76.53-2.33 1.2-.51.58-.96 1.53-.84 2.43.88.07 1.79-.45 2.35-1.1Z"
							/>
						</svg>
					) }
					{ mobilePlatform === 'android' && (
						<svg
							className="x-menu-mobile-app-banner-store-icon x-menu-mobile-app-banner-store-icon--google"
							viewBox="0 0 14 16"
							role="presentation"
							focusable="false"
							aria-hidden="true"
						>
							<path
								fill="#EA4335"
								d="M6.53719 7.37598L0.0585938 14.1638C0.322492 15.0975 1.29348 15.6414 2.22719 15.3775C2.36921 15.3372 2.50519 15.2798 2.6321 15.2063L9.92254 11.0544L6.5382 7.37598H6.53719Z"
							/>
							<path
								fill="#FBBC04"
								d="M13.0908 6.222L9.93817 4.41602L6.38965 7.53041L9.95227 11.0447L13.0808 9.25885C13.9198 8.81969 14.2431 7.78424 13.804 6.94521C13.6418 6.63598 13.39 6.38417 13.0808 6.222H13.0908Z"
							/>
							<path
								fill="#4285F4"
								d="M0.0584219 1.28311C0.0191394 1.42816 0 1.57723 0 1.7273V13.7196C0 13.8696 0.0201466 14.0187 0.0584219 14.1638L6.75962 7.54918L0.0584219 1.2821V1.28311Z"
							/>
							<path
								fill="#34A853"
								d="M6.58554 7.72356L9.93563 4.41677L2.65527 0.245774C2.3813 0.0856218 2.07006 5.79087e-06 1.75278 5.79087e-06C0.965112 -0.0020087 0.27213 0.521753 0.0585938 1.2792L6.58554 7.72456V7.72356Z"
							/>
						</svg>
					) }
					<span>{ __( 'Download', __i18n_text_domain__ ) }</span>
				</span>
			</a>
		);
	};

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
									// Close when keyboard focus leaves the nav+dropdown entirely (tabbing
									// past the last item), so the dropdown isn't mouse-dismiss-only.
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
											ref={ menuTriggerRef }
											type="button"
											role="menuitem"
											className="x-nav-link x-nav-link__menu x-link"
											// The dialog + its id only exist on the 2026 path; on the legacy path
											// the menu is a `role="menu"` without that id, so don't dangle the refs.
											aria-haspopup={ nav2026 ? 'dialog' : undefined }
											aria-controls={ nav2026 ? 'x-mobile-menu-2026' : undefined }
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
						<div
							ref={ dropdownRef }
							className={ clsx( 'x-dropdown x-dropdown--2026', {
								'is-dropdown-open': activeDropdown !== null,
							} ) }
						>
							{ nav2026Menus.map( ( menu ) => {
								if ( ! menu.groups ) {
									return null;
								}
								// Reading-order counter shared across this menu's groups: each
								// subcategory title takes one index, then its links take the next,
								// so the slide-in staggers title → its links → next title …
								let staggerIndex = 0;
								return (
									<div
										className="x-dropdown-content x-dropdown--2026"
										data-dropdown-name={ menu.name }
										id={ `x-dropdown-2026-${ menu.name }` }
										role="menu"
										aria-label={ menu.title }
										aria-hidden={ activeDropdown !== menu.name }
										key={ menu.name }
									>
										<div className="x-dropdown-subcategories">
											{ menu.groups.map( ( group ) => (
												<div className="x-dropdown-column-group" key={ group.title }>
													<h4
														className="x-dropdown-subcategory-title"
														role="presentation"
														style={ { '--stagger-index': staggerIndex++ } as React.CSSProperties }
													>
														{ group.title }
													</h4>
													<ul>
														{ group.items.map( ( item ) => (
															<ClickableItem
																key={ item.url }
																index={ staggerIndex++ }
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
								);
							} ) }
						</div>
					) }
					{ /*<!-- Nav bar ends here. -->*/ }

					{ /*<!-- Mobile menu starts here. -->*/ }
					{ nav2026 ? (
						<div
							id="x-mobile-menu-2026"
							className={ clsx( 'x-menu x-menu--2026', {
								'x-menu__active x-menu__open': isMobileMenuOpen,
								'is-opening': isMenuOpening,
							} ) }
							role="dialog"
							aria-modal="true"
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
								<div className="x-menu-mobile-main">
									{ /* Sticky, translucent header (logo ⇄ back + close + category title).
									   Lives inside the scroller so it stickies as the list scrolls beneath. */ }
									<div className="x-menu-mobile-header">
										<div className="x-menu-mobile-header-top">
											<a
												className={ clsx( 'x-menu-mobile-logo x-link', {
													'is-hidden': !! activeCategory,
												} ) }
												href={ localizeUrl( '//wordpress.com' ) }
												target="_self"
												tabIndex={ mobileMenuTabIndex }
											>
												<WordPressWordmark
													className="x-icon x-icon__logo"
													color={ logoColor ?? 'var(--studio-blue-50)' }
													size={ { width: 170, height: 36 } }
												/>
												<span className="x-hidden">WordPress.com</span>
											</a>
											<button
												type="button"
												className={ clsx( 'x-menu-mobile-back x-link', {
													'is-hidden': ! activeCategory,
												} ) }
												onClick={ () => setCurrentDropdown( null ) }
												tabIndex={ mobileMenuTabIndex }
											>
												<span className="x-menu-mobile-back-chevron" aria-hidden="true" />
												{ __( 'Back', __i18n_text_domain__ ) }
											</button>
											<button
												type="button"
												className="x-menu-button x-menu-mobile-close x-link"
												onClick={ closeMobileMenu }
												tabIndex={ mobileMenuTabIndex }
											>
												<span className="x-hidden">
													{ __( 'Close menu', __i18n_text_domain__ ) }
												</span>
												<span className="x-icon x-icon__close">
													<span></span>
													<span></span>
												</span>
											</button>
										</div>
										<h4
											className={ clsx( 'x-menu-mobile-category-title', {
												'is-visible': !! activeCategory,
											} ) }
										>
											{ activeCategory?.title }
										</h4>
									</div>
									{ variant !== 'minimal' && (
										<>
											<ul
												className={ clsx( 'x-menu-mobile-nav-list', {
													'is-hidden': !! activeCategory,
												} ) }
											>
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
											{ nav2026Menus
												.filter( ( menu ) => menu.groups )
												.flatMap( ( menu ) => {
													const isActive = activeCategory?.name === menu.name;
													// Each subcategory group is its own `.x-menu-mobile-dropdown-list`
													// (no wrapper div — matches the reference's flat structure so the
													// drill fade works). All lists for the active category share the
													// same `data-dropdown-name` and toggle `.is-visible` together.
													return ( menu.groups ?? [] ).map( ( group, groupIndex ) => (
														<ul
															className={ clsx( 'x-menu-mobile-dropdown-list', {
																'is-visible': isActive,
															} ) }
															data-dropdown-name={ menu.name }
															key={ `${ menu.name }-${ group.title }` }
														>
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
																		tabIndex={ isActive ? mobileMenuTabIndex : -1 }
																	/>
																</li>
															) ) }
														</ul>
													) );
												} ) }
										</>
									) }
								</div>
								<div className="x-menu-mobile-footer" ref={ mobileFooterRef }>
									{ renderAppBanner() }
									{ isLoggedIn ? (
										<a
											className="x-menu-mobile-user x-link"
											href={ localizeUrl( '//wordpress.com/me' ) }
											target="_self"
											tabIndex={ mobileMenuTabIndex }
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
