/* eslint-disable no-restricted-imports */
import { WordPressWordmark } from '@automattic/components';
import { useLocalizeUrl, useIsEnglishLocale, useLocale } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { HeaderProps } from '../types';
import { NonClickableItem, ClickableItem } from './menu-items';
import './style.scss';

const UniversalNavbarHeader = ( {
	className,
	isLoggedIn = false,
	sectionName,
	logoColor,
	variant = 'default',
}: HeaderProps ) => {
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
		<div className={ className }>
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
									{ variant !== 'minimal' ? (
										<>
											<li className="x-nav-item x-nav-item__wide">
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
															titleValue={ __( 'WordPress Hosting', __i18n_text_domain__ ) }
															content={ __( 'WordPress Hosting', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/hosting/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue={ __( 'Domain Names', __i18n_text_domain__ ) }
															content={ __( 'Domain Names', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/domains/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue={ __( 'Website Builder', __i18n_text_domain__ ) }
															content={ __( 'Website Builder', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/website-builder/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue={ __( 'Create a Blog', __i18n_text_domain__ ) }
															content={ __( 'Create a Blog', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/create-blog/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue={ __( 'Professional Email', __i18n_text_domain__ ) }
															content={ __( 'Professional Email', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/professional-email/' ) }
															type="dropdown"
															target="_self"
														/>
														{ isEnglishLocale && (
															<ClickableItem
																titleValue={ __( 'Website Design Services', __i18n_text_domain__ ) }
																content={ __( 'Website Design Services', __i18n_text_domain__ ) }
																urlValue={ localizeUrl(
																	'//wordpress.com/built-by/?ref=main-menu'
																) }
																type="dropdown"
																target="_self"
															/>
														) }
														<ClickableItem
															titleValue={ __( 'Link in Bio', __i18n_text_domain__ ) }
															content={ __( 'Link in Bio', __i18n_text_domain__ ) }
															urlValue={ localizeUrl(
																'//wordpress.com/setup/link-in-bio/intro?ref=main-menu',
																locale,
																isLoggedIn
															) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue={ __( 'Newsletter', __i18n_text_domain__ ) }
															content={ __( 'Newsletter', __i18n_text_domain__ ) }
															urlValue={ localizeUrl(
																'//wordpress.com/setup/newsletter/intro?ref=main-menu',
																locale,
																isLoggedIn
															) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue={ __( 'Video', __i18n_text_domain__ ) }
															content={ __( 'Video', __i18n_text_domain__ ) }
															urlValue={ localizeUrl(
																'//wordpress.com/setup/videopress/intro?ref=main-menu',
																locale,
																isLoggedIn
															) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue={ __( 'Course', __i18n_text_domain__ ) }
															content={ __( 'Course', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/create-a-course/' ) }
															type="dropdown"
															target="_self"
														/>
													</ul>
													<div className="x-dropdown-content-separator"></div>
													<ul>
														<ClickableItem
															titleValue={ __( 'Enterprise', __i18n_text_domain__ ) }
															content={ __( 'Enterprise', __i18n_text_domain__ ) }
															urlValue="https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav"
															type="dropdown"
														/>
													</ul>
												</div>
											</li>
											<li className="x-nav-item x-nav-item__wide">
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
															titleValue={ __( 'Features', __i18n_text_domain__ ) }
															content={ __( 'Overview', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/features/' ) }
															type="dropdown"
															target="_self"
														/>
													</ul>
													<div className="x-dropdown-content-separator"></div>
													<ul>
														<ClickableItem
															titleValue={ __( 'WordPress Themes', __i18n_text_domain__ ) }
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
															titleValue={ __( 'WordPress Plugins', __i18n_text_domain__ ) }
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
															titleValue={ __( 'Google Apps', __i18n_text_domain__ ) }
															content={ __( 'Google Apps', __i18n_text_domain__ ) }
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
															titleValue={ __( 'Support', __i18n_text_domain__ ) }
															content={ __( 'WordPress.com Support', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/support/' ) }
															type="dropdown"
														/>
														<ClickableItem
															titleValue={ __( 'News', __i18n_text_domain__ ) }
															content={ __( 'News', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/blog/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue={ __( 'Website Building Tips', __i18n_text_domain__ ) }
															content={ __( 'Website Building Tips', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/go/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue={ __( 'Business Name Generator', __i18n_text_domain__ ) }
															content={ __( 'Business Name Generator', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/business-name-generator/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue={ __( 'Logo Maker', __i18n_text_domain__ ) }
															content={ __( 'Logo Maker', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/logo-maker/' ) }
															type="dropdown"
															target="_self"
														/>
														<ClickableItem
															titleValue={ __( 'Daily Webinars', __i18n_text_domain__ ) }
															content={ __( 'Daily Webinars', __i18n_text_domain__ ) }
															urlValue={ localizeUrl( '//wordpress.com/webinars/' ) }
															type="dropdown"
															target="_self"
														/>
														{ isEnglishLocale && (
															<ClickableItem
																titleValue={ __( 'Learn WordPress', __i18n_text_domain__ ) }
																content={ __( 'Learn WordPress', __i18n_text_domain__ ) }
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
												titleValue={ __( 'Plans & Pricing', __i18n_text_domain__ ) }
												content={ __( 'Plans & Pricing', __i18n_text_domain__ ) }
												urlValue={ localizeUrl( '//wordpress.com/pricing/' ) }
												type="nav"
												target="_self"
											/>
										</>
									) : null }
								</ul>
								<ul className="x-nav-list x-nav-list__right">
									{ ! isLoggedIn && (
										<ClickableItem
											className="x-nav-item x-nav-item__wide"
											titleValue={ __( 'Log In', __i18n_text_domain__ ) }
											content={ __( 'Log In', __i18n_text_domain__ ) }
											urlValue={ localizeUrl( '//wordpress.com/log-in', locale, isLoggedIn, true ) }
											type="nav"
										/>
									) }
									<ClickableItem
										className="x-nav-item x-nav-item__wide"
										titleValue={ __( 'Get Started', __i18n_text_domain__ ) }
										content={ __( 'Get Started', __i18n_text_domain__ ) }
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
					{ /*<!-- Nav bar ends here. -->*/ }

					{ /*<!-- Mobile menu starts here. -->*/ }
					<div
						className={ isMobileMenuOpen ? 'x-menu x-menu__active x-menu__open' : 'x-menu' }
						role="menu"
						aria-label={ __( 'WordPress.com Navigation Menu', __i18n_text_domain__ ) }
						aria-hidden="true"
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
								tabIndex={ -1 }
							>
								<span className="x-hidden">
									{ __( 'Close the navigation menu', __i18n_text_domain__ ) }
								</span>
								<span className="x-icon x-icon__close">
									<span></span>
									<span></span>
								</span>
							</button>
							<div className="x-menu-list">
								<div className="x-menu-list-title">
									{ __( 'Get Started', __i18n_text_domain__ ) }
								</div>
								{ ! isLoggedIn && (
									<ul className="x-menu-grid">
										<ClickableItem
											titleValue={ __( 'Sign Up', __i18n_text_domain__ ) }
											content={ __( 'Sign Up', __i18n_text_domain__ ) }
											urlValue={ startUrl }
											type="menu"
										/>
										<ClickableItem
											titleValue={ __( 'Log In', __i18n_text_domain__ ) }
											content={ __( 'Log In', __i18n_text_domain__ ) }
											urlValue={ localizeUrl( '//wordpress.com/log-in', locale, isLoggedIn, true ) }
											type="menu"
										/>
									</ul>
								) }
							</div>
							{ variant !== 'minimal' ? (
								<>
									<div className="x-menu-list">
										<div className="x-hidden">{ __( 'About', __i18n_text_domain__ ) }</div>
										<ul className="x-menu-grid">
											<ClickableItem
												titleValue={ __( 'Plans & Pricing', __i18n_text_domain__ ) }
												content={ __( 'Plans & Pricing', __i18n_text_domain__ ) }
												urlValue={ localizeUrl( '//wordpress.com/pricing/' ) }
												type="menu"
											/>
										</ul>
									</div>
									<div className="x-menu-list">
										<div className="x-menu-list-title">
											{ __( 'Products', __i18n_text_domain__ ) }
										</div>
										<ul className="x-menu-grid">
											<ClickableItem
												titleValue={ __( 'WordPress Hosting', __i18n_text_domain__ ) }
												content={ __( 'WordPress Hosting', __i18n_text_domain__ ) }
												urlValue={ localizeUrl( '//wordpress.com/hosting/' ) }
												type="menu"
											/>
											<ClickableItem
												titleValue={ __( 'Domain Names', __i18n_text_domain__ ) }
												content={ __( 'Domain Names', __i18n_text_domain__ ) }
												urlValue={ localizeUrl( '//wordpress.com/domains/' ) }
												type="menu"
											/>
											<ClickableItem
												titleValue={ __( 'Website Builder', __i18n_text_domain__ ) }
												content={ __( 'Website Builder', __i18n_text_domain__ ) }
												urlValue={ localizeUrl( '//wordpress.com/website-builder/' ) }
												type="menu"
											/>
											<ClickableItem
												titleValue={ __( 'Create a Blog', __i18n_text_domain__ ) }
												content={ __( 'Create a Blog', __i18n_text_domain__ ) }
												urlValue={ localizeUrl( '//wordpress.com/create-blog/' ) }
												type="menu"
											/>
											<ClickableItem
												titleValue={ __( 'Professional Email', __i18n_text_domain__ ) }
												content={ __( 'Professional Email', __i18n_text_domain__ ) }
												urlValue={ localizeUrl( '//wordpress.com/professional-email/' ) }
												type="menu"
											/>
											<ClickableItem
												titleValue={ __( 'Enterprise', __i18n_text_domain__ ) }
												content={ __( 'Enterprise', __i18n_text_domain__ ) }
												urlValue="https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav"
												type="menu"
											/>
										</ul>
									</div>
									<div className="x-menu-list">
										<div className="x-menu-list-title">
											{ __( 'Features', __i18n_text_domain__ ) }
										</div>
										<ul className="x-menu-grid">
											<ClickableItem
												titleValue={ __( 'Features', __i18n_text_domain__ ) }
												content={ __( 'Overview', __i18n_text_domain__ ) }
												urlValue={ localizeUrl( '//wordpress.com/features/' ) }
												type="menu"
											/>
										</ul>
										<ul className="x-menu-grid">
											<ClickableItem
												titleValue={ __( 'WordPress Themes', __i18n_text_domain__ ) }
												content={ __( 'WordPress Themes', __i18n_text_domain__ ) }
												urlValue={ localizeUrl(
													'//wordpress.com/themes',
													locale,
													isLoggedIn,
													true
												) }
												type="menu"
											/>
											<ClickableItem
												titleValue={ __( 'WordPress Plugins', __i18n_text_domain__ ) }
												content={ __( 'WordPress Plugins', __i18n_text_domain__ ) }
												urlValue={ localizeUrl(
													'//wordpress.com/plugins',
													locale,
													isLoggedIn,
													true
												) }
												type="menu"
											/>
											<ClickableItem
												titleValue={ __( 'Google Apps', __i18n_text_domain__ ) }
												content={ __( 'Google Apps', __i18n_text_domain__ ) }
												urlValue={ localizeUrl( '//wordpress.com/google/' ) }
												type="menu"
											/>
										</ul>
									</div>
									<div className="x-menu-list">
										<div className="x-menu-list-title">
											{ __( 'Resources', __i18n_text_domain__ ) }
										</div>
										<ul className="x-menu-grid">
											<ClickableItem
												titleValue={ __( 'Support', __i18n_text_domain__ ) }
												content={ __( 'WordPress.com Support', __i18n_text_domain__ ) }
												urlValue={ localizeUrl( '//wordpress.com/support/' ) }
												type="menu"
											/>
											<ClickableItem
												titleValue={ __( 'News', __i18n_text_domain__ ) }
												content={ __( 'News', __i18n_text_domain__ ) }
												urlValue={ localizeUrl( '//wordpress.com/blog/' ) }
												type="menu"
											/>
											<ClickableItem
												titleValue={ __( 'Website Building Tips', __i18n_text_domain__ ) }
												content={ __( 'Website Building Tips', __i18n_text_domain__ ) }
												urlValue={ localizeUrl( '//wordpress.com/go/' ) }
												type="menu"
											/>
											<ClickableItem
												titleValue={ __( 'Business Name Generator', __i18n_text_domain__ ) }
												content={ __( 'Business Name Generator', __i18n_text_domain__ ) }
												urlValue={ localizeUrl( '//wordpress.com/business-name-generator/' ) }
												type="menu"
											/>
											<ClickableItem
												titleValue={ __( 'Logo Maker', __i18n_text_domain__ ) }
												content={ __( 'Logo Maker', __i18n_text_domain__ ) }
												urlValue={ localizeUrl( '//wordpress.com/logo-maker/' ) }
												type="menu"
											/>
											<ClickableItem
												titleValue={ __( 'Daily Webinars', __i18n_text_domain__ ) }
												content={ __( 'Daily Webinars', __i18n_text_domain__ ) }
												urlValue={ localizeUrl( '//wordpress.com/webinars/' ) }
												type="menu"
											/>
											{ isEnglishLocale && (
												<ClickableItem
													titleValue={ __( 'Learn WordPress', __i18n_text_domain__ ) }
													content={ __( 'Learn WordPress', __i18n_text_domain__ ) }
													urlValue={ localizeUrl( '//wordpress.com/learn/' ) }
													type="menu"
												/>
											) }
										</ul>
									</div>
								</>
							) : null }
						</div>
					</div>
					{ /*<!-- Mobile menu ends here. -->*/ }
				</div>
			</div>
		</div>
	);
};

export default UniversalNavbarHeader;
