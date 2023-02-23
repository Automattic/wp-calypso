/* eslint-disable no-restricted-imports */
import { WordPressWordmark } from '@automattic/components';
import { useLocalizeUrl, useIsEnglishLocale, useLocale } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { HeaderProps } from '../types';
import { NonClickableItem, ClickableItem } from './menu-items';
import './style.scss';

const UniversalNavbarHeader = ( { isLoggedIn = false, sectionName, logoColor }: HeaderProps ) => {
	const locale = useLocale();
	const localizeUrl = useLocalizeUrl();
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
												color={ logoColor ?? 'var(--studio-blue-50)' }
												size={ {
													width: 170,
													height: 36,
												} }
											/>
											<span className="x-hidden">WordPress.com</span>
										</a>
									</li>
									<li className="x-nav-item x-nav-item__wide">
										<NonClickableItem className="x-nav-link x-link" content={ __( 'Products' ) } />
										<div
											className="x-dropdown-content"
											data-dropdown-name="products"
											role="menu"
											aria-label={ __( 'Products' ) }
											aria-hidden="true"
										>
											<ul>
												<ClickableItem
													titleValue={ __( 'WordPress Hosting' ) }
													content={ __( 'WordPress Hosting' ) }
													urlValue={ localizeUrl( '//wordpress.com/hosting/' ) }
													type="dropdown"
													target="_self"
												/>
												<ClickableItem
													titleValue={ __( 'Domain Names' ) }
													content={ __( 'Domain Names' ) }
													urlValue={ localizeUrl( '//wordpress.com/domains/' ) }
													type="dropdown"
													target="_self"
												/>
												<ClickableItem
													titleValue={ __( 'Website Builder' ) }
													content={ __( 'Website Builder' ) }
													urlValue={ localizeUrl( '//wordpress.com/website-builder/' ) }
													type="dropdown"
													target="_self"
												/>
												<ClickableItem
													titleValue={ __( 'Create a Blog' ) }
													content={ __( 'Create a Blog' ) }
													urlValue={ localizeUrl( '//wordpress.com/create-blog/' ) }
													type="dropdown"
													target="_self"
												/>
												<ClickableItem
													titleValue={ __( 'Professional Email' ) }
													content={ __( 'Professional Email' ) }
													urlValue={ localizeUrl( '//wordpress.com/professional-email/' ) }
													type="dropdown"
													target="_self"
												/>
											</ul>
											<div className="x-dropdown-content-separator"></div>
											<ul>
												<ClickableItem
													titleValue={ __( 'Enterprise' ) }
													content={ __( 'Enterprise' ) }
													urlValue="https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav"
													type="dropdown"
												/>
											</ul>
										</div>
									</li>
									<li className="x-nav-item x-nav-item__wide">
										<NonClickableItem className="x-nav-link x-link" content={ __( 'Features' ) } />
										<div
											className="x-dropdown-content"
											data-dropdown-name="features"
											role="menu"
											aria-label={ __( 'Features' ) }
											aria-hidden="true"
										>
											<ul>
												<ClickableItem
													titleValue={ __( 'Features' ) }
													content={ __( 'Overview' ) }
													urlValue={ localizeUrl( '//wordpress.com/features/' ) }
													type="dropdown"
													target="_self"
												/>
											</ul>
											<div className="x-dropdown-content-separator"></div>
											<ul>
												<ClickableItem
													titleValue={ __( 'WordPress Themes' ) }
													content={ __( 'WordPress Themes' ) }
													urlValue={ localizeUrl( '//wordpress.com/themes', locale, isLoggedIn ) }
													type="dropdown"
												/>
												<ClickableItem
													titleValue={ __( 'WordPress Plugins' ) }
													content={ __( 'WordPress Plugins' ) }
													urlValue={ localizeUrl( '//wordpress.com/plugins', locale, isLoggedIn ) }
													type="dropdown"
												/>
												<ClickableItem
													titleValue={ __( 'Google Apps' ) }
													content={ __( 'Google Apps' ) }
													urlValue={ localizeUrl( '//wordpress.com/google/' ) }
													type="dropdown"
													target="_self"
												/>
											</ul>
										</div>
									</li>
									<li className="x-nav-item x-nav-item__wide">
										<NonClickableItem className="x-nav-link x-link" content={ __( 'Resources' ) } />
										<div
											className="x-dropdown-content"
											data-dropdown-name="resources"
											role="menu"
											aria-label={ __( 'Resources' ) }
											aria-hidden="true"
										>
											<ul>
												<ClickableItem
													titleValue={ __( 'Support' ) }
													content={ __( 'WordPress.com Support' ) }
													urlValue={ localizeUrl( '//wordpress.com/support/' ) }
													type="dropdown"
												/>
												<ClickableItem
													titleValue={ __( 'News' ) }
													content={ __( 'News' ) }
													urlValue={ localizeUrl( '//wordpress.com/blog/' ) }
													type="dropdown"
													target="_self"
												/>
												<ClickableItem
													titleValue={ __( 'Website Building Tips' ) }
													content={ __( 'Website Building Tips' ) }
													urlValue={ localizeUrl( '//wordpress.com/go/' ) }
													type="dropdown"
													target="_self"
												/>
												<ClickableItem
													titleValue={ __( 'Business Name Generator' ) }
													content={ __( 'Business Name Generator' ) }
													urlValue={ localizeUrl( '//wordpress.com/business-name-generator/' ) }
													type="dropdown"
													target="_self"
												/>
												<ClickableItem
													titleValue={ __( 'Logo Maker' ) }
													content={ __( 'Logo Maker' ) }
													urlValue={ localizeUrl( '//wordpress.com/logo-maker/' ) }
													type="dropdown"
													target="_self"
												/>
												<ClickableItem
													titleValue={ __( 'Daily Webinars' ) }
													content={ __( 'Daily Webinars' ) }
													urlValue={ localizeUrl( '//wordpress.com/webinars/' ) }
													type="dropdown"
													target="_self"
												/>
												{ isEnglishLocale && (
													<ClickableItem
														titleValue={ __( 'Learn WordPress' ) }
														content={ __( 'Learn WordPress' ) }
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
										titleValue={ __( 'Plans & Pricing' ) }
										content={ __( 'Plans & Pricing' ) }
										urlValue={ localizeUrl( '//wordpress.com/pricing/' ) }
										type="nav"
										target="_self"
									/>
								</ul>
								<ul className="x-nav-list x-nav-list__right">
									{ ! isLoggedIn && (
										<ClickableItem
											className="x-nav-item x-nav-item__wide"
											titleValue={ __( 'Log In' ) }
											content={ __( 'Log In' ) }
											urlValue={ localizeUrl( '//wordpress.com/log-in', locale, isLoggedIn ) }
											type="nav"
										/>
									) }
									<ClickableItem
										className="x-nav-item x-nav-item__wide"
										titleValue={ __( 'Get Started' ) }
										content={ __( 'Get Started' ) }
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
											<span className="x-hidden">{ __( 'Menu' ) }</span>
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
						aria-label={ __( 'WordPress.com Navigation Menu' ) }
						aria-hidden="true"
					>
						<div className="x-menu-overlay"></div>
						<div className="x-menu-content">
							<button
								className="x-menu-button x-link"
								onClick={ () => setMobileMenuOpen( false ) }
								tabIndex={ -1 }
							>
								<span className="x-hidden">{ __( 'Close the navigation menu' ) }</span>
								<span className="x-icon x-icon__close">
									<span></span>
									<span></span>
								</span>
							</button>
							<div className="x-menu-list">
								<div className="x-menu-list-title">{ __( 'Get Started' ) }</div>
								{ ! isLoggedIn && (
									<ul className="x-menu-grid">
										<ClickableItem
											titleValue={ __( 'Sign Up' ) }
											content={ __( 'Sign Up' ) }
											urlValue={ startUrl }
											type="menu"
										/>
										<ClickableItem
											titleValue={ __( 'Log In' ) }
											content={ __( 'Log In' ) }
											urlValue={ localizeUrl( '//wordpress.com/log-in', locale, isLoggedIn ) }
											type="menu"
										/>
									</ul>
								) }
							</div>
							<div className="x-menu-list">
								<div className="x-hidden">{ __( 'About' ) }</div>
								<ul className="x-menu-grid">
									<ClickableItem
										titleValue={ __( 'Plans & Pricing' ) }
										content={ __( 'Plans & Pricing' ) }
										urlValue={ localizeUrl( '//wordpress.com/pricing/' ) }
										type="menu"
									/>
								</ul>
							</div>
							<div className="x-menu-list">
								<div className="x-menu-list-title">{ __( 'Products' ) }</div>
								<ul className="x-menu-grid">
									<ClickableItem
										titleValue={ __( 'WordPress Hosting' ) }
										content={ __( 'WordPress Hosting' ) }
										urlValue={ localizeUrl( '//wordpress.com/hosting/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ __( 'Domain Names' ) }
										content={ __( 'Domain Names' ) }
										urlValue={ localizeUrl( '//wordpress.com/domains/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ __( 'Website Builder' ) }
										content={ __( 'Website Builder' ) }
										urlValue={ localizeUrl( '//wordpress.com/website-builder/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ __( 'Create a Blog' ) }
										content={ __( 'Create a Blog' ) }
										urlValue={ localizeUrl( '//wordpress.com/create-blog/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ __( 'Professional Email' ) }
										content={ __( 'Professional Email' ) }
										urlValue={ localizeUrl( '//wordpress.com/professional-email/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ __( 'Enterprise' ) }
										content={ __( 'Enterprise' ) }
										urlValue="https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav"
										type="menu"
									/>
								</ul>
							</div>
							<div className="x-menu-list">
								<div className="x-menu-list-title">{ __( 'Features' ) }</div>
								<ul className="x-menu-grid">
									<ClickableItem
										titleValue={ __( 'Features' ) }
										content={ __( 'Overview' ) }
										urlValue={ localizeUrl( '//wordpress.com/features/' ) }
										type="menu"
									/>
								</ul>
								<ul className="x-menu-grid">
									<ClickableItem
										titleValue={ __( 'WordPress Themes' ) }
										content={ __( 'WordPress Themes' ) }
										urlValue={ localizeUrl( '//wordpress.com/themes', locale, isLoggedIn ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ __( 'WordPress Plugins' ) }
										content={ __( 'WordPress Plugins' ) }
										urlValue={ localizeUrl( '//wordpress.com/plugins', locale, isLoggedIn ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ __( 'Google Apps' ) }
										content={ __( 'Google Apps' ) }
										urlValue={ localizeUrl( '//wordpress.com/google/' ) }
										type="menu"
									/>
								</ul>
							</div>
							<div className="x-menu-list">
								<div className="x-menu-list-title">{ __( 'Resources' ) }</div>
								<ul className="x-menu-grid">
									<ClickableItem
										titleValue={ __( 'Support' ) }
										content={ __( 'WordPress.com Support' ) }
										urlValue={ localizeUrl( '//wordpress.com/support/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ __( 'News' ) }
										content={ __( 'News' ) }
										urlValue={ localizeUrl( '//wordpress.com/blog/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ __( 'Website Building Tips' ) }
										content={ __( 'Website Building Tips' ) }
										urlValue={ localizeUrl( '//wordpress.com/go/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ __( 'Business Name Generator' ) }
										content={ __( 'Business Name Generator' ) }
										urlValue={ localizeUrl( '//wordpress.com/business-name-generator/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ __( 'Logo Maker' ) }
										content={ __( 'Logo Maker' ) }
										urlValue={ localizeUrl( '//wordpress.com/logo-maker/' ) }
										type="menu"
									/>
									<ClickableItem
										titleValue={ __( 'Daily Webinars' ) }
										content={ __( 'Daily Webinars' ) }
										urlValue={ localizeUrl( '//wordpress.com/webinars/' ) }
										type="menu"
									/>
									{ isEnglishLocale && (
										<ClickableItem
											titleValue={ __( 'Learn WordPress' ) }
											content={ __( 'Learn WordPress' ) }
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
