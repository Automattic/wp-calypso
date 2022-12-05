import { Gridicon } from '@automattic/components';
import { useLocale, localizeUrl } from '@automattic/i18n-utils';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import Gravatar from 'calypso/components/gravatar';
import JetpackLogo from 'calypso/components/jetpack-logo';
import JetpackSaleBanner from 'calypso/jetpack-cloud/sections/pricing/sale-banner';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { trailingslashit } from 'calypso/lib/route';
import { isUserLoggedIn, getCurrentUser } from 'calypso/state/current-user/selectors';
import { getJetpackSaleCoupon } from 'calypso/state/marketing/selectors';
import useMobileBtn from './use-mobile-btn';
import useSubmenuBtn from './use-submenu-btn';
import useUserMenu from './use-user-menu';

import './style.scss';

export const MAIN_CONTENT_ID = 'content';

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
	const sections = useMemo(
		() => [
			{
				label: translate( 'Products' ),
				id: 'products',
				items: [
					{
						label: translate( 'Security' ),
						tagline: translate( 'Protect your site' ),
						href: `${ JETPACK_COM_BASE_URL }/features/security/`,
						items: [
							{
								label: translate( 'VaultPress' ),
								tagline: translate( 'Save every change in real-time' ),
								href: `${ JETPACK_COM_BASE_URL }/upgrade/backup/`,
							},
							{
								label: translate( 'Scan' ),
								tagline: translate( 'Stay one step ahead of threats' ),
								href: `${ JETPACK_COM_BASE_URL }/upgrade/scan/`,
							},
							{
								label: translate( 'Akismet' ),
								tagline: translate( 'Stop comment and form spam' ),
								href: `${ JETPACK_COM_BASE_URL }/upgrade/anti-spam/`,
							},
						],
					},
					{
						label: translate( 'Performance' ),
						tagline: translate( 'Speed up your site' ),
						href: `${ JETPACK_COM_BASE_URL }/features/performance/`,
						items: [
							{
								label: translate( 'Site Search' ),
								tagline: translate( 'Help them find what they need' ),
								href: `${ JETPACK_COM_BASE_URL }/upgrade/search/`,
							},
							{
								label: translate( 'Boost' ),
								tagline: translate( 'Instant speed and SEO' ),
								href: `${ JETPACK_COM_BASE_URL }/boost/`,
							},
							{
								label: translate( 'VideoPress' ),
								tagline: translate( 'High-quality, ad-free video' ),
								href: `${ JETPACK_COM_BASE_URL }/videopress/`,
							},
						],
					},
					{
						label: translate( 'Growth' ),
						tagline: translate( 'Grow your audience' ),
						href: `${ JETPACK_COM_BASE_URL }/features/growth/`,
						items: [
							{
								label: translate( 'Social', { context: 'Jetpack product name' } ),
								tagline: translate( 'Write once, post everywhere' ),
								href: `${ JETPACK_COM_BASE_URL }/social/`,
							},
							{
								label: translate( 'CRM' ),
								tagline: translate( 'Connect with your people' ),
								href: 'https://jetpackcrm.com/?utm_medium=automattic_referred&utm_source=jpcom_header',
							},
						],
					},
				],
			},
			{
				label: translate( 'Pricing' ),
				href: `${ JETPACK_COM_BASE_URL }/pricing/`,
			},
			{
				label: translate( 'Agencies' ),
				href: `${ JETPACK_COM_BASE_URL }/for/agencies/`,
			},
			{
				label: translate( 'Support' ),
				href: `${ JETPACK_COM_BASE_URL }/support/`,
			},
			{
				label: translate( 'Blog' ),
				href: `${ JETPACK_COM_BASE_URL }/blog/`,
			},
		],
		[ translate ]
	);

	const onLinkClick = useCallback( ( e ) => {
		recordTracksEvent( 'calypso_jetpack_nav_item_click', {
			nav_item: e.currentTarget
				.getAttribute( 'href' )
				// Remove the hostname https://jetpack.com/ from the href
				// (including other languages, ie. es.jetpack.com, fr.jetpack.com, etc.)
				?.replace( /https?:\/\/[a-z]{0,2}.?jetpack.com/, '' ),
		} );
	}, [] );

	useSubmenuBtn();
	useUserMenu();
	useMobileBtn();

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<>
			{ jetpackSaleCoupon && <JetpackSaleBanner coupon={ jetpackSaleCoupon } /> }

			<div className="jpcom-masterbar">
				<header className="header js-header force-opaque">
					<nav className="header__content">
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
								{ sections.map( ( { label, id, href, items } ) => {
									const hasChildren = Array.isArray( items );
									const Tag = hasChildren ? 'a' : ExternalLink;

									return (
										<li
											className={ classNames( {
												'is-active':
													pathname &&
													href &&
													new URL( trailingslashit( href ) ).pathname ===
														trailingslashit( pathname ),
											} ) }
											key={ href || id }
										>
											<Tag
												className={ hasChildren ? 'header__menu-btn js-menu-btn' : '' }
												href={ href ? localizeUrl( href, locale ) : `#${ id }` }
												aria-expanded={ hasChildren ? false : undefined }
												onClick={ href ? onLinkClick : undefined }
											>
												{ label }
												{ hasChildren && <Gridicon icon="chevron-down" size={ 18 } /> }
											</Tag>
											{ hasChildren && (
												<div id={ id } className="header__submenu js-menu" tabIndex={ -1 }>
													<div className="header__submenu-content">
														<button className="header__back-btn js-menu-back">
															<Gridicon icon="chevron-left" size={ 18 } />
															{ translate( 'Back' ) }
														</button>
														<ul className="header__submenu-categories-list">
															{ items.map( ( { label, tagline, href, items } ) => (
																<li key={ href }>
																	<ExternalLink
																		className="header__submenu-category header__submenu-link"
																		href={ localizeUrl( href, locale ) }
																		onClick={ onLinkClick }
																	>
																		<span className="header__submenu-label">
																			<span className="header__submenu-chevron">
																				<Gridicon icon="chevron-right" size={ 18 } />
																			</span>
																			{ label }
																		</span>
																		<span className="header__submenu-tagline">{ tagline } </span>
																	</ExternalLink>
																	<ul className="header__submenu-links-list">
																		{ items.map( ( { label, tagline, href } ) => (
																			<li key={ href }>
																				<ExternalLink
																					className="header__submenu-link"
																					href={ localizeUrl( href, locale ) }
																					onClick={ onLinkClick }
																				>
																					<span className="header__submenu-label">{ label }</span>
																					<span className="header__submenu-tagline">
																						{ tagline }
																					</span>
																				</ExternalLink>
																			</li>
																		) ) }
																	</ul>
																</li>
															) ) }
														</ul>
													</div>
												</div>
											) }
										</li>
									);
								} ) }
							</ul>

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
											<div id="profile" className="user-menu__tooltip js-user-menu">
												<div className="tooltip">
													<span className="user-menu__greetings">
														{ translate( 'Hi, %s!', {
															args: user?.display_name || user?.username,
														} ) }
													</span>
													<ul className="user-menu__list">
														<li>
															<a className="js-manage-sites" href={ localizeUrl( '/', locale ) }>
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
				</header>
			</div>
		</>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default JetpackComMasterbar;
