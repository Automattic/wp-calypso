import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import JetpackLogo from 'calypso/components/jetpack-logo';
import JetpackSaleBanner from 'calypso/jetpack-cloud/sections/pricing/sale-banner';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getJetpackSaleCoupon } from 'calypso/state/marketing/selectors';
import './style.scss';
import antiSpamIcon from './assets/icons/anti-spam.svg';
import backupIcon from './assets/icons/backup.svg';
import boostIcon from './assets/icons/boost.svg';
import crmIcon from './assets/icons/crm.svg';
import growthIcon from './assets/icons/growth.svg';
import performanceIcon from './assets/icons/performance.svg';
import scanIcon from './assets/icons/scan.svg';
import searchIcon from './assets/icons/search.svg';
import securityIcon from './assets/icons/security.svg';
import videoIcon from './assets/icons/video.svg';

const JETPACK_COM_BASE_URL = 'https://jetpack.com';
const BP = 960; // Breakpoint defined in stylesheet

const JetpackComMasterbar: React.FC = () => {
	const translate = useTranslate();
	const menuItems = useMemo(
		() => [
			{
				label: translate( 'Products' ),
				items: [
					{
						category: {
							label: translate( 'Security' ),
							description: translate( 'Protect your site' ),
							href: '/features/security/',
							icon: securityIcon,
						},
						items: [
							{
								label: translate( 'Backup' ),
								description: translate( 'Save every change' ),
								href: '/upgrade/backup/',
								icon: backupIcon,
							},
							{
								label: translate( 'Scan' ),
								description: translate( 'Stay one step ahead of threats' ),
								href: '/upgrade/scan/',
								icon: scanIcon,
							},
							{
								label: translate( 'Anti-spam' ),
								description: translate( 'Stop comment and form spam' ),
								href: '/upgrade/anti-spam/',
								icon: antiSpamIcon,
							},
						],
					},
					{
						category: {
							label: translate( 'Performance' ),
							description: translate( 'Speed up your site' ),
							href: '/features/performance/',
							icon: performanceIcon,
						},
						items: [
							{
								label: translate( 'Site Search' ),
								description: translate( 'Help them find what they need' ),
								href: '/upgrade/search/',
								icon: searchIcon,
							},
							{
								label: translate( 'Boost' ),
								description: translate( 'Instant speed and SEO' ),
								href: '/boost/',
								icon: boostIcon,
							},
							{
								label: translate( 'VideoPress' ),
								description: translate( 'High-quality, ad-free video' ),
								href: '/videopress/',
								icon: videoIcon,
							},
						],
					},
					{
						category: {
							label: translate( 'Growth' ),
							description: translate( 'Grow your audience' ),
							href: '/features/growth/',
							icon: growthIcon,
						},
						items: [
							{
								label: translate( 'CRM' ),
								description: translate( 'Connect with your people' ),
								href: 'https://jetpackcrm.com/',
								icon: crmIcon,
							},
						],
					},
				],
			},
			{
				label: translate( 'Pricing' ),
				href: '/pricing/',
			},
			{
				label: translate( 'Support' ),
				href: '/support/',
			},
			{
				label: translate( 'Blog' ),
				href: '/blog/',
			},
		],
		[ translate ]
	);

	const jetpackSaleCoupon = useSelector( getJetpackSaleCoupon );
	const [ isMenuOpen, setIsMenuOpen ] = useState( false );

	const toggleMenu = () => {
		setIsMenuOpen( ( currentState ) => ! currentState );
	};
	const toggleSubmenu = useCallback( ( item: HTMLElement ) => {
		item.classList.toggle( 'is-active' );

		const submenu = item.querySelector( '.jpcom-masterbar__submenu' );

		if ( submenu ) {
			submenu.classList.toggle( 'is-visible' );
		}
	}, [] );
	const onSubmenuClick = useCallback(
		( e ) => {
			if ( window.innerWidth <= BP ) {
				toggleSubmenu( e.currentTarget );
			}
		},
		[ toggleSubmenu ]
	);
	const onSubmenuKeyPress = useCallback(
		( e ) => {
			const key = e.code || e.key;

			if ( key.indexOf( 'Enter' ) > -1 && window.innerWidth <= BP ) {
				toggleSubmenu( e.currentTarget );
			}
		},
		[ toggleSubmenu ]
	);
	const onLinkClick = useCallback( ( e ) => {
		recordTracksEvent( 'calypso_jetpack_nav_item_click', {
			nav_item: e.currentTarget.getAttribute( 'href' )?.replace( JETPACK_COM_BASE_URL, '' ),
		} );
	}, [] );

	return (
		<>
			{ jetpackSaleCoupon && <JetpackSaleBanner coupon={ jetpackSaleCoupon } /> }
			<nav className="jpcom-masterbar">
				<div className="jpcom-masterbar__inner">
					<ExternalLink
						className="jpcom-masterbar__logo"
						href={ JETPACK_COM_BASE_URL }
						onClick={ () => {
							recordTracksEvent( 'calypso_jetpack_nav_logo_click' );
						} }
					>
						<JetpackLogo className="jpcom-masterbar__jetpack-logo" full size={ 43 } />
					</ExternalLink>

					<Button
						className={ classNames( [ 'jpcom-masterbar__navbutton', 'mobilenav' ], {
							'is-active': isMenuOpen,
						} ) }
						aria-label={ translate( 'Menu' ) as string }
						aria-controls="navigation"
						onClick={ toggleMenu }
					>
						<span className="jpcom-masterbar__navbox">
							<span className="jpcom-masterbar__navinner"></span>
						</span>
						<span className="jpcom-masterbar__navlabel">{ translate( 'Menu' ) }</span>
					</Button>

					<ul className={ classNames( 'jpcom-masterbar__nav', { 'is-open': isMenuOpen } ) }>
						{ menuItems.map( ( { label, href, items }, index ) => (
							<li
								className={ classNames( 'jpcom-masterbar__nav-item', { 'with-submenu': ! href } ) }
								key={ index }
								tabIndex={ href ? undefined : 0 }
								onClick={ href ? undefined : onSubmenuClick }
								onKeyPress={ href ? undefined : onSubmenuKeyPress }
							>
								{ href ? (
									<a
										className={ href.indexOf( 'pricing' ) > -1 ? 'current' : '' }
										href={ `${ JETPACK_COM_BASE_URL }${ href }` }
										onClick={ onLinkClick }
									>
										{ label }
									</a>
								) : (
									<>
										<span className="jpcom-masterbar__pri-nav-label">
											{ label }
											<Gridicon icon="chevron-down"></Gridicon>
										</span>
										<div className="jpcom-masterbar__submenu">
											<ul className="jpcom-masterbar__submenu-list">
												{ items?.map( ( { category, items }, index ) => (
													<li key={ index }>
														<span className="jpcom-masterbar__submenu-category-wrapper">
															<span className="jpcom-masterbar__submenu-category">
																<img src={ category.icon } alt="" />
																<a
																	className="jpcom-masterbar__submenu-link"
																	href={
																		category.href.indexOf( 'http' ) > -1
																			? category.href
																			: ` ${ JETPACK_COM_BASE_URL }${ category.href }`
																	}
																	onClick={ onLinkClick }
																>
																	<span className="jpcom-masterbar__submenu-label">
																		{ category.label }
																	</span>
																	<span className="jpcom-masterbar__submenu-desc">
																		{ category.description }
																	</span>
																</a>
															</span>
														</span>
														<ul className="jpcom-masterbar__submenu-subcategory">
															{ items?.map( ( { label, description, icon, href }, index ) => (
																<li key={ index }>
																	<img src={ icon } alt="" />
																	<a
																		className="jpcom-masterbar__submenu-link"
																		href={
																			href.indexOf( 'http' ) > -1
																				? href
																				: ` ${ JETPACK_COM_BASE_URL }${ href }`
																		}
																		onClick={ onLinkClick }
																	>
																		<span className="jpcom-masterbar__submenu-label">
																			<span>{ label }</span>
																		</span>
																		<span className="jpcom-masterbar__submenu-desc">
																			{ description }
																		</span>
																	</a>
																</li>
															) ) }
														</ul>
													</li>
												) ) }
											</ul>
										</div>
									</>
								) }
							</li>
						) ) }
					</ul>
				</div>
			</nav>
		</>
	);
};

export default JetpackComMasterbar;
