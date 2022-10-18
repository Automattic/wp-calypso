import './style.scss';
import { useTranslate } from 'i18n-calypso';
import WordPressWordmark from 'calypso/components/wordpress-wordmark';
import UniversalNavbarBtnMenuItem from 'calypso/layout/universal-navbar-header/btn-menu-item.jsx';
import UniversalNavbarLiMenuItem from 'calypso/layout/universal-navbar-header/li-menu-item.jsx';

const UniversalNavbarHeader = () => {
	const translate = useTranslate();

	return (
		<div>
			<div className="x-root lpc-header-nav-wrapper">
				<div className="lpc-header-nav-container">
					{ /*<!-- Nav bar starts here. -->*/ }
					<div className="masterbar-menu">
						<div className="masterbar">
							<nav className="x-nav" ariaLabel="WordPress.com">
								<ul className="x-nav-list x-nav-list--left">
									<li className="x-nav-item">
										<a role="menuitem" className="x-nav-link x-nav-link--logo x-link" href="/">
											<WordPressWordmark className="x-icon x-icon--logo" />
											<span className="x-hidden">WordPress.com</span>
										</a>
									</li>
									<li className="x-nav-item x-nav-item--wide">
										<UniversalNavbarBtnMenuItem
											className={ 'x-nav-link x-link' }
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
													urlValue={ '//wordpress.com/hosting/' }
													type={ 'dropdown' }
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Domain Names' ) }
													elementContent={ translate( 'Domain Names' ) }
													urlValue={ '//wordpress.com/domains/' }
													type={ 'dropdown' }
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Website Builder' ) }
													elementContent={ translate( 'Website Builder' ) }
													urlValue={ '//wordpress.com/website-builder/' }
													type={ 'dropdown' }
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Create a Blog' ) }
													elementContent={ translate( 'Create a Blog' ) }
													urlValue={ '//wordpress.com/create-blog/' }
													type={ 'dropdown' }
												/>
												<UniversalNavbarLiMenuItem
													className={ 'x-menu-grid-item' }
													titleValue={ translate( 'Professional Email' ) }
													elementContent={ translate( 'Professional Email' ) }
													urlValue={ '//wordpress.com/professional-email/' }
													type={ 'dropdown' }
												/>
											</ul>
											<div className="x-dropdown-content-separator"></div>
											<ul>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Enterprise' ) }
													elementContent={ translate( 'Enterprise' ) }
													urlValue={
														'https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav'
													}
													type={ 'dropdown' }
												/>
											</ul>
										</div>
									</li>
									<li className="x-nav-item x-nav-item--wide">
										<UniversalNavbarBtnMenuItem
											className={ 'x-nav-link x-link' }
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
													urlValue={ '//wordpress.com/features/' }
													type={ 'dropdown' }
												/>
											</ul>
											<div className="x-dropdown-content-separator"></div>
											<ul>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'WordPress Themes' ) }
													elementContent={ translate( 'WordPress Themes' ) }
													urlValue={ '//wordpress.com/themes' }
													type={ 'dropdown' }
												/>
												<UniversalNavbarLiMenuItem
													className={ 'x-menu-grid-item' }
													titleValue={ translate( 'WordPress Plugins' ) }
													elementContent={ translate( 'WordPress Plugins' ) }
													urlValue={ '//wordpress.com/plugins' }
													type={ 'dropdown' }
												/>
												<UniversalNavbarLiMenuItem
													className={ 'x-menu-grid-item' }
													titleValue={ translate( 'Google Apps' ) }
													elementContent={ translate( 'Google Apps' ) }
													urlValue={ '//wordpress.com/google/' }
													type={ 'dropdown' }
												/>
											</ul>
										</div>
									</li>
									<li className="x-nav-item x-nav-item--wide">
										<UniversalNavbarBtnMenuItem
											className={ 'x-nav-link x-link' }
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
													urlValue={ '//en.support.wordpress.com/' }
													type={ 'dropdown' }
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'News' ) }
													elementContent={ translate( 'News' ) }
													urlValue={ '//wordpress.com/blog/' }
													type={ 'dropdown' }
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Website Building Tips' ) }
													elementContent={ translate( 'Website Building Tips' ) }
													urlValue={ '//wordpress.com/go/' }
													type={ 'dropdown' }
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Business Name Generator' ) }
													elementContent={ translate( 'Business Name Generator' ) }
													urlValue={ '//wordpress.com/business-name-generator/' }
													type={ 'dropdown' }
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Logo Maker' ) }
													elementContent={ translate( 'Logo Maker' ) }
													urlValue={ '//wordpress.com/logo-maker/' }
													type={ 'dropdown' }
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'Daily Webinars' ) }
													elementContent={ translate( 'Daily Webinars' ) }
													urlValue={ '//wordpress.com/webinars/' }
													type={ 'dropdown' }
												/>
												<UniversalNavbarLiMenuItem
													titleValue={ translate( 'WordPress Courses' ) }
													elementContent={ translate( 'WordPress Courses' ) }
													urlValue={ '//wordpress.com/courses/' }
													type={ 'dropdown' }
												/>
											</ul>
										</div>
									</li>
									<UniversalNavbarLiMenuItem
										className={ 'x-nav-item x-nav-item--wide' }
										titleValue={ translate( 'Plans & Pricing' ) }
										elementContent={ translate( 'Plans & Pricing' ) }
										urlValue={ '//wordpress.com/pricing/' }
										type={ 'nav' }
									/>
								</ul>
								<ul className="x-nav-list x-nav-list--right">
									<UniversalNavbarLiMenuItem
										className={ 'x-nav-item x-nav-item--wide' }
										titleValue={ translate( 'Log In' ) }
										elementContent={ translate( 'Log In' ) }
										urlValue={
											'//wordpress.com/wp-login.php?redirect_to=https%3A%2F%2Fwordpress.com%2F'
										}
										type={ 'nav' }
									/>
									<UniversalNavbarLiMenuItem
										className={ 'x-nav-item x-nav-item--wide' }
										titleValue={ translate( 'Get Started' ) }
										elementContent={ translate( 'Get Started' ) }
										urlValue={ '//wordpress.com/start' }
										type={ 'nav' }
										typeClassName={ 'x-nav-link x-nav-link--primary x-link' }
									/>
									<li className="x-nav-item x-nav-item--narrow">
										<button
											role="menuitem"
											className="x-nav-link x-nav-link--menu x-link"
											aria-haspopup="true"
											aria-expanded="false"
										>
											<span className="x-hidden">{ translate( 'Menu' ) }</span>
											<span className="x-icon x-icon--menu">
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
						className="x-menu"
						role="menu"
						aria-label={ translate( 'WordPress.com Navigation Menu' ) }
						aria-hidden="true"
					>
						<div className="x-menu-overlay"></div>
						<div className="x-menu-content">
							<button className="x-menu-button x-link" tabIndex="-1">
								<span className="x-hidden">{ translate( 'Close the navigation menu' ) }</span>
								<span className="x-icon x-icon--close">
									<span></span>
									<span></span>
								</span>
							</button>
							<div className="x-menu-list">
								<div className="x-menu-list-title">{ translate( 'Get Started' ) }</div>
								<ul className="x-menu-grid">
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'Sign Up' ) }
										elementContent={ translate( 'Sign Up' ) }
										urlValue={ '//wordpress.com/start' }
										type={ 'menu' }
									/>
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'Log In' ) }
										elementContent={ translate( 'Log In' ) }
										urlValue={
											'//wordpress.com/wp-login.php?redirect_to=https%3A%2F%2Fwordpress.com%2F'
										}
										type={ 'menu' }
									/>
								</ul>
							</div>
							<div className="x-menu-list">
								<div className="x-hidden">{ translate( 'About' ) }</div>
								<ul className="x-menu-grid">
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'Plans & Pricing' ) }
										elementContent={ translate( 'Plans & Pricing' ) }
										urlValue={ '//wordpress.com/pricing/' }
										type={ 'menu' }
									/>
								</ul>
							</div>
							<div className="x-menu-list">
								<div className="x-menu-list-title">{ translate( 'Products' ) }</div>
								<ul className="x-menu-grid">
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'WordPress Hosting' ) }
										elementContent={ translate( 'WordPress Hosting' ) }
										urlValue={ '//wordpress.com/hosting/' }
										type={ 'menu' }
									/>
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'Domain Names' ) }
										elementContent={ translate( 'Domain Names' ) }
										urlValue={ '//wordpress.com/domains/' }
										type={ 'menu' }
									/>
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'Website Builder' ) }
										elementContent={ translate( 'Website Builder' ) }
										urlValue={ '//wordpress.com/website-builder/' }
										type={ 'menu' }
									/>
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'Create a Blog' ) }
										elementContent={ translate( 'Create a Blog' ) }
										urlValue={ '//wordpress.com/create-blog/' }
										type={ 'menu' }
									/>
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'Professional Email' ) }
										elementContent={ translate( 'Professional Email' ) }
										urlValue={ '//wordpress.com/professional-email/' }
										type={ 'menu' }
									/>
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'Enterprise' ) }
										elementContent={ translate( 'Enterprise' ) }
										urlValue={
											'https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav'
										}
										type={ 'menu' }
									/>
								</ul>
							</div>
							<div className="x-menu-list">
								<div className="x-menu-list-title">{ translate( 'Features' ) }</div>
								<ul className="x-menu-grid">
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'Features' ) }
										elementContent={ translate( 'Overview' ) }
										urlValue={ '//wordpress.com/features/' }
										type={ 'menu' }
									/>
								</ul>
								<ul className="x-menu-grid">
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'WordPress Themes' ) }
										elementContent={ translate( 'WordPress Themes' ) }
										urlValue={ '//wordpress.com/themes' }
										type={ 'menu' }
									/>
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'WordPress Plugins' ) }
										elementContent={ translate( 'WordPress Plugins' ) }
										urlValue={ '//wordpress.com/plugins' }
										type={ 'menu' }
									/>
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'Google Apps' ) }
										elementContent={ translate( 'Google Apps' ) }
										urlValue={ '//wordpress.com/google/' }
										type={ 'menu' }
									/>
								</ul>
							</div>
							<div className="x-menu-list">
								<div className="x-menu-list-title">{ translate( 'Resources' ) }</div>
								<ul className="x-menu-grid">
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'Support' ) }
										elementContent={ translate( 'WordPress.com Support' ) }
										urlValue={ '//en.support.wordpress.com/' }
										type={ 'menu' }
									/>
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'News' ) }
										elementContent={ translate( 'News' ) }
										urlValue={ '//wordpress.com/blog/' }
										type={ 'menu' }
									/>
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'Website Building Tips' ) }
										elementContent={ translate( 'Website Building Tips' ) }
										urlValue={ '//wordpress.com/go/' }
										type={ 'menu' }
									/>
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'Business Name Generator' ) }
										elementContent={ translate( 'Business Name Generator' ) }
										urlValue={ '//wordpress.com/business-name-generator/' }
										type={ 'menu' }
									/>
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'Logo Maker' ) }
										elementContent={ translate( 'Logo Maker' ) }
										urlValue={ '//wordpress.com/logo-maker/' }
										type={ 'menu' }
									/>
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'Daily Webinars' ) }
										elementContent={ translate( 'Daily Webinars' ) }
										urlValue={ '//wordpress.com/webinars/' }
										type={ 'menu' }
									/>
									<UniversalNavbarLiMenuItem
										className={ 'x-menu-grid-item' }
										titleValue={ translate( 'WordPress Courses' ) }
										elementContent={ translate( 'WordPress Courses' ) }
										urlValue={ '//wordpress.com/courses/' }
										type={ 'menu' }
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
