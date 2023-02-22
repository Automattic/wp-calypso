/* eslint-disable no-restricted-imports */
import { WordPressWordmark } from '@automattic/components';
import { useLocalizeUrl, useIsEnglishLocale } from '@automattic/i18n-utils';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate, getLocaleSlug } from 'i18n-calypso';
import { useState } from 'react';
import { HeaderProps } from '../types';
import { NonClickableItem, ClickableItem } from './menu-items';

import './style.scss';

const UniversalNavbarHeader = ( { isLoggedIn = false, sectionName }: HeaderProps ) => {
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();
	const locale = getLocaleSlug() ?? undefined;
	const [ isMobileMenuOpen, setMobileMenuOpen ] = useState( false );
	const isEnglishLocale = useIsEnglishLocale();

	const startUrl = addQueryArgs(
		// url
		sectionName === 'plugins'
			? localizeUrl( '//wordpress.com/start/business', locale, isLoggedIn )
			: localizeUrl( '//wordpress.com/start', locale, isLoggedIn ),
		// query
		sectionName
			? {
					ref: sectionName + '-lp',
			  }
			: {}
	);

	return (
		<div>
			<div className="x-root lpc-header-nav-wrapper">
				<div className="lpc-header-nav-container">
					{ /*<!-- Nav bar starts here. -->*/ }
					<div className="masterbar-menu">
						<div className="masterbar">
							<nav className="x-nav" aria-label="WordPress.com">
								<ul className="x-nav-list x-nav-list__left">
									<li className="x-nav-item">
										<a
											role="menuitem"
											className="x-nav-link x-nav-link__logo x-link"
											href={ localizeUrl( '//wordpress.com' ) }
											target="_self"
										>
											<WordPressWordmark
												className="x-icon x-icon__logo"
												color="var(--studio-blue-50)"
											/>
											<span className="x-hidden">WordPress.com</span>
										</a>
									</li>
									<li className="x-nav-item x-nav-item__wide">
										<NonClickableItem
											className="x-nav-link x-link"
											content={ translate( 'Products' ) }
										/>
										<div
											className="x-dropdown-content"
											data-dropdown-name="products"
											role="menu"
											aria-label={ translate( 'Products' ) }
											aria-hidden="true"
										>
											<ul>
												<ClickableItem
													titleValue={ translate( 'WordPress Hosting' ) }
													content={ translate( 'WordPress Hosting' ) }
													urlValue={ localizeUrl( '//wordpress.com/hosting/' ) }
													type="dropdown"
													target="_self"
												/>
												<ClickableItem
													titleValue={ translate( 'Domain Names' ) }
													content={ translate( 'Domain Names' ) }
													urlValue={ localizeUrl( '//wordpress.com/domains/' ) }
													type="dropdown"
													target="_self"
												/>
												<ClickableItem
													titleValue={ translate( 'Website Builder' ) }
													content={ translate( 'Website Builder' ) }
													urlValue={ localizeUrl( '//wordpress.com/website-builder/' ) }
													type="dropdown"
													target="_self"
												/>
												<ClickableItem
													titleValue={ translate( 'Create a Blog' ) }
													content={ translate( 'Create a Blog' ) }
													urlValue={ localizeUrl( '//wordpress.com/create-blog/' ) }
													type="dropdown"
													target="_self"
												/>
												<ClickableItem
													titleValue={ translate( 'Professional Email' ) }
													content={ translate( 'Professional Email' ) }
													urlValue={ localizeUrl( '//wordpress.com/professional-email/' ) }
													type="dropdown"
													target="_self"
												/>
											</ul>
											<div className="x-dropdown-content-separator"></div>
											<ul>
												<ClickableItem
													titleValue={ translate( 'Enterprise' ) }
													content={ translate( 'Enterprise' ) }
													urlValue="https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav"
													type="dropdown"
												/>
											</ul>
										</div>
									</li>
									<li className="x-nav-item x-nav-item__wide">
										<NonClickableItem
											className="x-nav-link x-link"
											content={ translate( 'Features' ) }
										/>
										<div
											className="x-dropdown-content"
											data-dropdown-name="features"
											role="menu"
											aria-label={ translate( 'Features' ) }
											aria-hidden="true"
										>
											<ul>
												<ClickableItem
													titleValue={ translate( 'Features' ) }
													content={ translate( 'Overview' ) }
													urlValue={ localizeUrl( '//wordpress.com/features/' ) }
													type="dropdown"
													target="_self"
												/>
											</ul>
											<div className="x-dropdown-content-separator"></div>
											<ul>
												<ClickableItem
													titleValue={ translate( 'WordPress Themes' ) }
													content={ translate( 'WordPress Themes' ) }
													urlValue={ localizeUrl( '//wordpress.com/themes', locale, isLoggedIn ) }
													type="dropdown"
												/>
												<ClickableItem
													titleValue={ translate( 'WordPress Plugins' ) }
													content={ translate( 'WordPress Plugins' ) }
													urlValue={ localizeUrl( '//wordpress.com/plugins', locale, isLoggedIn ) }
													type="dropdown"
												/>
												<ClickableItem
													titleValue={ translate( 'Google Apps' ) }
													content={ translate( 'Google Apps' ) }
													urlValue={ localizeUrl( '//wordpress.com/google/' ) }
													type="dropdown"
													target="_self"
												/>
											</ul>
										</div>
									</li>
									<li className="x-nav-item x-nav-item__wide">
										<NonClickableItem
											className="x-nav-link x-link"
											content={ translate( 'Resources' ) }
										/>
										<div
											className="x-dropdown-content"
											data-dropdown-name="resources"
											role="menu"
											aria-label={ translate( 'Resources' ) }
											aria-hidden="true"
										>
											<ul>
												<ClickableItem
													titleValue={ translate( 'Support' ) }
													content={ translate( 'WordPress.com Support' ) }
													urlValue={ localizeUrl( '//wordpress.com/support/' ) }
													type="dropdown"
												/>
												<ClickableItem
													titleValue={ translate( 'News' ) }
													content={ translate( 'News' ) }
													urlValue={ localizeUrl( '//wordpress.com/blog/' ) }
													type="dropdown"
													target="_self"
												/>
												<ClickableItem
													titleValue={ translate( 'Website Building Tips' ) }
													content={ translate( 'Website Building Tips' ) }
													urlValue={ localizeUrl( '//wordpress.com/go/' ) }
													type="dropdown"
													target="_self"
												/>
												<ClickableItem
													titleValue={ translate( 'Business Name Generator' ) }
													content={ translate( 'Business Name Generator' ) }
													urlValue={ localizeUrl( '//wordpress.com/business-name-generator/' ) }
													type="dropdown"
													target="_self"
												/>
												<ClickableItem
													titleValue={ translate( 'Logo Maker' ) }
													content={ translate( 'Logo Maker' ) }
													urlValue={ localizeUrl( '//wordpress.com/logo-maker/' ) }
													type="dropdown"
													target="_self"
												/>
												<ClickableItem
													titleValue={ translate( 'Daily Webinars' ) }
													content={ translate( 'Daily Webinars' ) }
													urlValue={ localizeUrl( '//wordpress.com/webinars/' ) }
													type="dropdown"
													target="_self"
												/>
												{ isEnglishLocale && (
													<ClickableItem
														titleValue={ translate( 'Learn WordPress' ) }
														content={ translate( 'Learn WordPress' ) }
														urlValue={ localizeUrl( '//wordpress.com/learn/' ) }
														type="dropdown"
														target="_self"
													/>
												) }
											</ul>
										</div>
									</li>
									<ClickableItem
										className="x-nav-item x-nav-item__wide"
										titleValue={ translate( 'Plans & Pricing' ) }
										content={ translate( 'Plans & Pricing' ) }
										urlValue={ localizeUrl( '//wordpress.com/pricing/' ) }
										type="nav"
										target="_self"
									/>
								</ul>
								<ul className="x-nav-list x-nav-list__right">
									<ClickableItem
										className="x-nav-item x-nav-item__wide"
										titleValue={ translate( 'Log In' ) }
										content={ translate( 'Log In' ) }
										urlValue={ localizeUrl( '//wordpress.com/log-in', locale, isLoggedIn ) }
										type="nav"
									/>
									<ClickableItem
										className="x-nav-item x-nav-item__wide"
										titleValue={ translate( 'Get Started' ) }
										content={ translate( 'Get Started' ) }
										urlValue={ startUrl }
										type="nav"
										typeClassName="x-nav-link x-nav-link__primary x-link cta-btn-nav"
									/>
									<li className="x-nav-item x-nav-item__narrow">
										<button
											role="menuitem"
											className="x-nav-link x-nav-link__menu x-link"
											aria-haspopup="true"
											aria-expanded="false"
											onClick={ () => setMobileMenuOpen( true ) }
										>
											<span className="x-hidden">{ translate( 'Menu' ) }</span>
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
					{ /*<!-- Nav bar ends here. -->*/ }

					{ /*<!-- Mobile menu starts here. -->*/ }
					<div
						className={ isMobileMenuOpen ? 'x-menu x-menu__active x-menu__open' : 'x-menu' }
						role="menu"
						aria-label={ translate( 'WordPress.com Navigation Menu' ) }
						aria-hidden="true"
					>
						<div className="x-menu-overlay"></div>
						<div className="x-menu-content">
							<button
								className="x-menu-button x-link"
								onClick={ () => setMobileMenuOpen( false ) }
								tabIndex={ -1 }
							>
								<span className="x-hidden">{ translate( 'Close the navigation menu' ) }</span>
								<span className="x-icon x-icon__close">
									<span></span>
									<span></span>
								</span>
							</button>
							<div className="x-menu-list">
								<div className="x-menu-list-title">{ translate( 'Get Started' ) }</div>
								<ul className="x-menu-grid">
									<ClickableItem
										titleValue={ translate( 'Sign Up' ) }
										content={ translate( 'Sign Up' ) }
										urlValue={ startUrl }
										type="menu"
									/>
									<ClickableItem
										titleValue={ translate( 'Log In' ) }
										content={ translate( 'Log In' ) }
										urlValue={ localizeUrl( '//wordpress.com/log-in', locale, isLoggedIn ) }
										type="menu"
									/>
								</ul>
							</div>
							<div className="x-menu-list">
								<div className="x-hidden">{ translate( 'About' ) }</div>
								<ul className="x-menu-grid">
									<ClickableItem
										titleValue={ translate( 'Plans & Pricing' ) }
										content={ translate( 'Plans & Pricing' ) }
										urlValue={ localizeUrl( '//wordpress.com/pricing/' ) }
										type="menu"
									/>
								</ul>
							</div>
							<div className="x-menu-list">
								<div className="x-menu-list-title">{ translate( 'Products' ) }</div>
								<ul className="x-menu-grid">
									<ClickableItem
										titleValue={ translate( 'WordPress Hosting' ) }
										content={ translate( 'WordPress Hosting' ) }
										urlValue={ localizeUrl( '//wordpress.com/hosting/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ translate( 'Domain Names' ) }
										content={ translate( 'Domain Names' ) }
										urlValue={ localizeUrl( '//wordpress.com/domains/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ translate( 'Website Builder' ) }
										content={ translate( 'Website Builder' ) }
										urlValue={ localizeUrl( '//wordpress.com/website-builder/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ translate( 'Create a Blog' ) }
										content={ translate( 'Create a Blog' ) }
										urlValue={ localizeUrl( '//wordpress.com/create-blog/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ translate( 'Professional Email' ) }
										content={ translate( 'Professional Email' ) }
										urlValue={ localizeUrl( '//wordpress.com/professional-email/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ translate( 'Enterprise' ) }
										content={ translate( 'Enterprise' ) }
										urlValue="https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav"
										type="menu"
									/>
								</ul>
							</div>
							<div className="x-menu-list">
								<div className="x-menu-list-title">{ translate( 'Features' ) }</div>
								<ul className="x-menu-grid">
									<ClickableItem
										titleValue={ translate( 'Features' ) }
										content={ translate( 'Overview' ) }
										urlValue={ localizeUrl( '//wordpress.com/features/' ) }
										type="menu"
									/>
								</ul>
								<ul className="x-menu-grid">
									<ClickableItem
										titleValue={ translate( 'WordPress Themes' ) }
										content={ translate( 'WordPress Themes' ) }
										urlValue={ localizeUrl( '//wordpress.com/themes', locale, isLoggedIn ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ translate( 'WordPress Plugins' ) }
										content={ translate( 'WordPress Plugins' ) }
										urlValue={ localizeUrl( '//wordpress.com/plugins', locale, isLoggedIn ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ translate( 'Google Apps' ) }
										content={ translate( 'Google Apps' ) }
										urlValue={ localizeUrl( '//wordpress.com/google/' ) }
										type="menu"
									/>
								</ul>
							</div>
							<div className="x-menu-list">
								<div className="x-menu-list-title">{ translate( 'Resources' ) }</div>
								<ul className="x-menu-grid">
									<ClickableItem
										titleValue={ translate( 'Support' ) }
										content={ translate( 'WordPress.com Support' ) }
										urlValue={ localizeUrl( '//wordpress.com/support/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ translate( 'News' ) }
										content={ translate( 'News' ) }
										urlValue={ localizeUrl( '//wordpress.com/blog/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ translate( 'Website Building Tips' ) }
										content={ translate( 'Website Building Tips' ) }
										urlValue={ localizeUrl( '//wordpress.com/go/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ translate( 'Business Name Generator' ) }
										content={ translate( 'Business Name Generator' ) }
										urlValue={ localizeUrl( '//wordpress.com/business-name-generator/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ translate( 'Logo Maker' ) }
										content={ translate( 'Logo Maker' ) }
										urlValue={ localizeUrl( '//wordpress.com/logo-maker/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ translate( 'Daily Webinars' ) }
										content={ translate( 'Daily Webinars' ) }
										urlValue={ localizeUrl( '//wordpress.com/webinars/' ) }
										type="menu"
									/>
									{ isEnglishLocale && (
										<ClickableItem
											titleValue={ translate( 'Learn WordPress' ) }
											content={ translate( 'Learn WordPress' ) }
											urlValue={ localizeUrl( '//wordpress.com/learn/' ) }
											type="menu"
										/>
									) }
								</ul>
							</div>
						</div>
					</div>
					{ /*<!-- Mobile menu ends here. -->*/ }
				</div>
			</div>
		</div>
	);
};

export default UniversalNavbarHeader;
