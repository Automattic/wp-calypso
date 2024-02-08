/* eslint-disable jsx-a11y/anchor-is-valid */
import Menupop from './menupop';

import './core-masterbar.scss';

function WpAdminBar() {
	return (
		<div id="wpadminbar" class="nojq calypso-core-admin-bar">
			<div class="quicklinks" id="wp-toolbar" role="navigation" aria-label="Toolbar">
				<ul id="wp-admin-bar-root-default" class="ab-top-menu">
					<Menupop id="wp-admin-bar-wp-logo">
						<a href="/sites" class="ab-item logo-container">
							<span class="ab-icon" aria-hidden="true"></span>
						</a>
					</Menupop>
					<Menupop id="wp-admin-bar-site-name">
						<a
							class="ab-item"
							aria-haspopup="true"
							href="#"
							onClick={ () => alert( 'Should take you to the front-end of your site' ) }
						></a>
						<div class="ab-sub-wrapper">
							<ul id="wp-admin-bar-site-name-default" class="ab-submenu">
								<li id="wp-admin-bar-view-site">
									<a
										class="ab-item"
										href="#"
										onClick={ () => alert( 'Should take you to the front-end of your site' ) }
									>
										Visit Site
									</a>
								</li>
							</ul>
						</div>
					</Menupop>
					<li id="wp-admin-bar-comments">
						<a
							class="ab-item"
							href="#"
							onClick={ () =>
								alert(
									'Should take you to comment moderation page for this site (which will be different depending on whether your global classic view is toggled on or not)'
								)
							}
						>
							<span class="ab-icon" aria-hidden="true"></span>
							<span class="ab-label awaiting-mod pending-count count-0" aria-hidden="true">
								0
							</span>
							<span class="screen-reader-text comments-in-moderation-text">
								0 Comments in moderation
							</span>
						</a>
					</li>
					<Menupop id="wp-admin-bar-new-content">
						<a
							class="ab-item"
							aria-haspopup="true"
							href="#"
							onClick={ () =>
								alert(
									'Clicking this should take you to the wp-admin new post editor for this site'
								)
							}
						>
							<span class="ab-icon" aria-hidden="true"></span>
							<span class="ab-label">New</span>
						</a>
						<div class="ab-sub-wrapper">
							<ul id="wp-admin-bar-new-content-default" class="ab-submenu">
								<li id="wp-admin-bar-new-post">
									<a
										class="ab-item"
										href="#"
										onClick={ () =>
											alert(
												'Clicking this should take you to the wp-admin new post editor for this site'
											)
										}
									>
										Post
									</a>
								</li>
								<li id="wp-admin-bar-new-media">
									<a
										class="ab-item"
										href="#"
										onClick={ () =>
											alert(
												'Should take you to media library for this site (which will be different depending on whether your global classic view is toggled on or not)'
											)
										}
									>
										Media
									</a>
								</li>
								<li id="wp-admin-bar-new-page">
									<a
										class="ab-item"
										href="#"
										onClick={ () =>
											alert(
												'Clicking this should take you to the wp-admin new page editor for this site'
											)
										}
									>
										Page
									</a>
								</li>
								<li id="wp-admin-bar-new-user">
									<a
										class="ab-item"
										href="#"
										onClick={ () =>
											alert(
												'Should take you to the user management page for this site (which will be different depending on whether your global classic view is toggled on or not)'
											)
										}
									>
										User
									</a>
								</li>
								<li id="wp-admin-bar-new-user">
									<a
										class="ab-item"
										href="#"
										onClick={ () =>
											alert(
												'Should take you to add domain screen for this site (which only exists in Calypso)'
											)
										}
									>
										Domain
									</a>
								</li>
							</ul>
						</div>
					</Menupop>
				</ul>
				<ul id="wp-admin-bar-top-secondary" class="ab-top-secondary ab-top-menu">
					<Menupop id="wp-admin-bar-my-account" class="with-avatar">
						<a
							class="ab-item"
							aria-haspopup="true"
							href="#"
							onClick={ () =>
								alert(
									'For classic view users this should take you to the site specific /wp-admin/profile.php, else /me'
								)
							}
						>
							Howdy, <span class="display-name">Dave</span>
							<img
								alt=""
								src="/img/avatar.png"
								class="avatar avatar-26 photo"
								height="26"
								width="26"
								loading="lazy"
								decoding="async"
							/>
						</a>
						<div class="ab-sub-wrapper">
							<ul id="wp-admin-bar-user-actions" class="ab-submenu">
								<li id="wp-admin-bar-user-info">
									<a
										class="ab-item"
										tabindex="-1"
										href="#"
										onClick={ () =>
											alert(
												'For classic view users this should take you to the site specific /wp-admin/profile.php, else /me'
											)
										}
									>
										<img
											alt=""
											src="/img/avatar.png"
											class="avatar avatar-64 photo"
											height="64"
											width="64"
											loading="lazy"
											decoding="async"
										/>
									</a>
								</li>
								<li id="wp-admin-bar-edit-profile">
									<a
										class="ab-item"
										href="#"
										onClick={ () =>
											alert(
												'For classic view users this should take you to the site specific /wp-admin/profile.php, else /me'
											)
										}
									>
										Edit Profile
									</a>
								</li>
								<li id="wp-admin-bar-edit-profile">
									<a class="ab-item" href="/me/account">
										Account Settings
									</a>
								</li>
								<li id="wp-admin-bar-logout">
									<a class="ab-item" href="#" onClick={ () => alert( 'Should log you out' ) }>
										Log Out
									</a>
								</li>
							</ul>
						</div>
					</Menupop>
					<li id="wp-admin-bar-wp-notifications">
						<a
							href=""
							class="ab-item"
							onClick={ () =>
								alert(
									"This should open the notification panel on the right side of the page, or redirect to the notifications page in reader if that doesn't work"
								)
							}
						>
							<span class="ab-icon" aria-hidden="true"></span>
						</a>
					</li>
					<li id="wp-admin-bar-wp-help">
						<a
							href="#"
							class="ab-item"
							onClick={ () =>
								alert( 'This should open the help center popover on the right side of the page' )
							}
						>
							<span class="ab-icon" aria-hidden="true"></span>
						</a>
					</li>
				</ul>
			</div>
			<a class="screen-reader-shortcut" href="#" onClick={ () => alert( 'Should log you out' ) }>
				Log Out
			</a>
		</div>
	);
}

export default WpAdminBar;
