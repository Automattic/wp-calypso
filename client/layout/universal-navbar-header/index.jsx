import './nav-style.scss';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { useTranslate, getLocaleSlug } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import WordPressWordmark from 'calypso/components/wordpress-wordmark';
import UniversalNavbarBtnMenuItem from 'calypso/layout/universal-navbar-header/btn-menu-item.jsx';
import UniversalNavbarLiMenuItem from 'calypso/layout/universal-navbar-header/li-menu-item.jsx';
import { addQueryArgs } from 'calypso/lib/route';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSectionName } from 'calypso/state/ui/selectors';

const UniversalNavbarHeader = () => {
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();
	const locale = getLocaleSlug();
	const [ isMobileMenuOpen, setMobileMenuOpen ] = useState( false );
	const sectionName = useSelector( getSectionName );
	const isLoggedIn = useSelector( isUserLoggedIn );

	const startUrl = addQueryArgs(
		{
			ref: sectionName + '-lp',
		},
		sectionName === 'plugins'
			? localizeUrl( '//wordpress.com/start/business', locale, isLoggedIn )
			: localizeUrl( '//wordpress.com/start', locale, isLoggedIn )
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
											<WordPressWordmark className="x-icon x-icon__logo" />
											<span className="x-hidden">WordPress.com</span>
										</a>
									</li>
									<li className="x-nav-item x-nav-item__wide">
										<UniversalNavbarBtnMenuItem
											className="x-nav-link x-link"
											elementContent={ translate( 'Products' ) }
										/>
										<div
											className="x-dropdown-content"
											data-dropdown-name="products"
											role="menu"
											aria-label={ translate( 'Products' ) }
											aria-hidden="true"
										>
											<ul>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'WordPress Hosting' ) }
													elementContent={ translate( 'WordPress Hosting' ) }
													urlValue={ localizeUrl( '//wordpress.com/hosting/' ) }
													type="dropdown"
													target="_self"
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Domain Names' ) }
													elementContent={ translate( 'Domain Names' ) }
													urlValue={ localizeUrl( '//wordpress.com/domains/' ) }
													type="dropdown"
													target="_self"
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Website Builder' ) }
													elementContent={ translate( 'Website Builder' ) }
													urlValue={ localizeUrl( '//wordpress.com/website-builder/' ) }
													type="dropdown"
													target="_self"
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Create a Blog' ) }
													elementContent={ translate( 'Create a Blog' ) }
													urlValue={ localizeUrl( '//wordpress.com/create-blog/' ) }
													type="dropdown"
													target="_self"
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Professional Email' ) }
													elementContent={ translate( 'Professional Email' ) }
													urlValue={ localizeUrl( '//wordpress.com/professional-email/' ) }
													type="dropdown"
													target="_self"
												/>
											</ul>
											<div className="x-dropdown-content-separator"></div>
											<ul>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Enterprise' ) }
													elementContent={ translate( 'Enterprise' ) }
													urlValue="https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav"
													type="dropdown"
												/>
											</ul>
										</div>
									</li>
									<li className="x-nav-item x-nav-item__wide">
										<UniversalNavbarBtnMenuItem
											className="x-nav-link x-link"
											elementContent={ translate( 'Features' ) }
										/>
										<div
											className="x-dropdown-content"
											data-dropdown-name="features"
											role="menu"
											aria-label={ translate( 'Features' ) }
											aria-hidden="true"
										>
											<ul>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Features' ) }
													elementContent={ translate( 'Overview' ) }
													urlValue={ localizeUrl( '//wordpress.com/features/' ) }
													type="dropdown"
													target="_self"
												/>
											</ul>
											<div className="x-dropdown-content-separator"></div>
											<ul>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'WordPress Themes' ) }
													elementContent={ translate( 'WordPress Themes' ) }
													urlValue={ localizeUrl( '//wordpress.com/themes', locale, isLoggedIn ) }
													type="dropdown"
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'WordPress Plugins' ) }
													elementContent={ translate( 'WordPress Plugins' ) }
													urlValue={ localizeUrl( '//wordpress.com/plugins', locale, isLoggedIn ) }
													type="dropdown"
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Google Apps' ) }
													elementContent={ translate( 'Google Apps' ) }
													urlValue={ localizeUrl( '//wordpress.com/google/' ) }
													type="dropdown"
													target="_self"
												/>
											</ul>
										</div>
									</li>
									<li className="x-nav-item x-nav-item__wide">
										<UniversalNavbarBtnMenuItem
											className="x-nav-link x-link"
											elementContent={ translate( 'Resources' ) }
										/>
										<div
											className="x-dropdown-content"
											data-dropdown-name="resources"
											role="menu"
											aria-label={ translate( 'Resources' ) }
											aria-hidden="true"
										>
											<ul>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Support' ) }
													elementContent={ translate( 'WordPress.com Support' ) }
													urlValue={ localizeUrl( '//wordpress.com/support/' ) }
													type="dropdown"
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'News' ) }
													elementContent={ translate( 'News' ) }
													urlValue={ localizeUrl( '//wordpress.com/blog/' ) }
													type="dropdown"
													target="_self"
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Website Building Tips' ) }
													elementContent={ translate( 'Website Building Tips' ) }
													urlValue={ localizeUrl( '//wordpress.com/go/' ) }
													type="dropdown"
													target="_self"
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Business Name Generator' ) }
													elementContent={ translate( 'Business Name Generator' ) }
													urlValue={ localizeUrl( '//wordpress.com/business-name-generator/' ) }
													type="dropdown"
													target="_self"
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Logo Maker' ) }
													elementContent={ translate( 'Logo Maker' ) }
													urlValue={ localizeUrl( '//wordpress.com/logo-maker/' ) }
													type="dropdown"
													target="_self"
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Daily Webinars' ) }
													elementContent={ translate( 'Daily Webinars' ) }
													urlValue={ localizeUrl( '//wordpress.com/webinars/' ) }
													type="dropdown"
													target="_self"
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'WordPress Courses' ) }
													elementContent={ translate( 'WordPress Courses' ) }
													urlValue={ localizeUrl( '//wordpress.com/courses/' ) }
													type="dropdown"
													target="_self"
												/>
											</ul>
										</div>
									</li>
									<UniversalNavbarLiMenuItem
										className="x-nav-item x-nav-item__wide"
										titleValue={ translate( 'Plans & Pricing' ) }
										elementContent={ translate( 'Plans & Pricing' ) }
										urlValue={ localizeUrl( '//wordpress.com/pricing/' ) }
										type="nav"
										target="_self"
									/>
								</ul>
								<ul className="x-nav-list x-nav-list__right">
									<UniversalNavbarLiMenuItem
										className="x-nav-item x-nav-item__wide"
										titleValue={ translate( 'Log In' ) }
										elementContent={ translate( 'Log In' ) }
										urlValue={ localizeUrl( '//wordpress.com/log-in', locale, isLoggedIn ) }
										type="nav"
									/>
									<UniversalNavbarLiMenuItem
										className="x-nav-item x-nav-item__wide"
										titleValue={ translate( 'Get Started' ) }
										elementContent={ translate( 'Get Started' ) }
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
								tabIndex="-1"
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
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'Sign Up' ) }
										elementContent={ translate( 'Sign Up' ) }
										urlValue={ startUrl }
										type="menu"
									/>
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'Log In' ) }
										elementContent={ translate( 'Log In' ) }
										urlValue={ localizeUrl( '/log-in', locale, isLoggedIn ) }
										type="menu"
									/>
								</ul>
							</div>
							<div className="x-menu-list">
								<div className="x-hidden">{ translate( 'About' ) }</div>
								<ul className="x-menu-grid">
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'Plans & Pricing' ) }
										elementContent={ translate( 'Plans & Pricing' ) }
										urlValue={ localizeUrl( '//wordpress.com/pricing/' ) }
										type="menu"
									/>
								</ul>
							</div>
							<div className="x-menu-list">
								<div className="x-menu-list-title">{ translate( 'Products' ) }</div>
								<ul className="x-menu-grid">
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'WordPress Hosting' ) }
										elementContent={ translate( 'WordPress Hosting' ) }
										urlValue={ localizeUrl( '//wordpress.com/hosting/' ) }
										type="menu"
									/>
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'Domain Names' ) }
										elementContent={ translate( 'Domain Names' ) }
										urlValue={ localizeUrl( '//wordpress.com/domains/' ) }
										type="menu"
									/>
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'Website Builder' ) }
										elementContent={ translate( 'Website Builder' ) }
										urlValue={ localizeUrl( '//wordpress.com/website-builder/' ) }
										type="menu"
									/>
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'Create a Blog' ) }
										elementContent={ translate( 'Create a Blog' ) }
										urlValue={ localizeUrl( '//wordpress.com/create-blog/' ) }
										type="menu"
									/>
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'Professional Email' ) }
										elementContent={ translate( 'Professional Email' ) }
										urlValue={ localizeUrl( '//wordpress.com/professional-email/' ) }
										type="menu"
									/>
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'Enterprise' ) }
										elementContent={ translate( 'Enterprise' ) }
										urlValue="https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav"
										type="menu"
									/>
								</ul>
							</div>
							<div className="x-menu-list">
								<div className="x-menu-list-title">{ translate( 'Features' ) }</div>
								<ul className="x-menu-grid">
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'Features' ) }
										elementContent={ translate( 'Overview' ) }
										urlValue={ localizeUrl( '//wordpress.com/features/' ) }
										type="menu"
									/>
								</ul>
								<ul className="x-menu-grid">
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'WordPress Themes' ) }
										elementContent={ translate( 'WordPress Themes' ) }
										urlValue={ localizeUrl( '//wordpress.com/themes', locale, isLoggedIn ) }
										type="menu"
									/>
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'WordPress Plugins' ) }
										elementContent={ translate( 'WordPress Plugins' ) }
										urlValue={ localizeUrl( '//wordpress.com/plugins', locale, isLoggedIn ) }
										type="menu"
									/>
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'Google Apps' ) }
										elementContent={ translate( 'Google Apps' ) }
										urlValue={ localizeUrl( '//wordpress.com/google/' ) }
										type="menu"
									/>
								</ul>
							</div>
							<div className="x-menu-list">
								<div className="x-menu-list-title">{ translate( 'Resources' ) }</div>
								<ul className="x-menu-grid">
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'Support' ) }
										elementContent={ translate( 'WordPress.com Support' ) }
										urlValue={ localizeUrl( '//wordpress.com/support/' ) }
										type="menu"
									/>
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'News' ) }
										elementContent={ translate( 'News' ) }
										urlValue={ localizeUrl( '//wordpress.com/blog/' ) }
										type="menu"
									/>
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'Website Building Tips' ) }
										elementContent={ translate( 'Website Building Tips' ) }
										urlValue={ localizeUrl( '//wordpress.com/go/' ) }
										type="menu"
									/>
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'Business Name Generator' ) }
										elementContent={ translate( 'Business Name Generator' ) }
										urlValue={ localizeUrl( '//wordpress.com/business-name-generator/' ) }
										type="menu"
									/>
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'Logo Maker' ) }
										elementContent={ translate( 'Logo Maker' ) }
										urlValue={ localizeUrl( '//wordpress.com/logo-maker/' ) }
										type="menu"
									/>
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'Daily Webinars' ) }
										elementContent={ translate( 'Daily Webinars' ) }
										urlValue={ localizeUrl( '//wordpress.com/webinars/' ) }
										type="menu"
									/>
									<UniversalNavbarLiMenuItem
										titleValue={ translate( 'WordPress Courses' ) }
										elementContent={ translate( 'WordPress Courses' ) }
										urlValue={ localizeUrl( '//wordpress.com/courses/' ) }
										type="menu"
									/>
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
