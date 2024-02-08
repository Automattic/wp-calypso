/* eslint-disable jsx-a11y/anchor-is-valid */
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { getLogoutUrl } from 'calypso/lib/user/shared-utils';
import { useSelector } from 'calypso/state';
import { getSiteCommentCounts } from 'calypso/state/comments/selectors';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import { getSite } from 'calypso/state/sites/selectors';
import Menupop from './menupop';

import './core-masterbar.scss';

function WpAdminBar( { siteId, siteSlug, renderHelpCenter, renderNotifications } ) {
	const translate = useTranslate();

	// Internal management links.
	const postEditorURL = useSelector( ( state ) => getEditorUrl( state, siteId ) );
	const pageEditorURL = useSelector( ( state ) => getEditorUrl( state, siteId, null, 'page' ) );
	const mediaURL = `/media/${ siteSlug }`; // Note - this needs updated to handle wp-admin preference.
	const addUserURL = `/people/new/${ siteSlug }`; // Note - this needs updated to handle wp-admin preference.
	const commentsURL = `/comments/all/${ siteSlug }`; // Note - this needs updated to handle wp-admin preference.
	const profileURL = `/me`; // Note - this needs updated to handle wp-admin preference. /wp-admin/profile.php
	const domainsURL = `/domains/manage/${ siteSlug }`;
	const accountSettingsURL = '/me/account';
	const logoutURL = getLogoutUrl();

	// Data
	const currentUser = useSelector( getCurrentUser ) || {};
	const { display_name: userDisplayName, avatar_URL: avatarURL } = currentUser;
	const selectedSite = useSelector( ( state ) => getSite( state, siteId ) ) || {};
	const { URL: siteURL, name: siteName } = selectedSite;
	const counts = useSelector( ( state ) => getSiteCommentCounts( state, siteId ) );
	const pendingCommentsCount = counts?.pending || 0;

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
						<a class="ab-item" aria-haspopup="true" href={ siteURL }>
							{ siteName }
						</a>
						<div class="ab-sub-wrapper">
							<ul id="wp-admin-bar-site-name-default" class="ab-submenu">
								<li id="wp-admin-bar-view-site">
									<a class="ab-item" href={ siteURL }>
										{ translate( 'Visit Site' ) }
									</a>
								</li>
							</ul>
						</div>
					</Menupop>
					<li id="wp-admin-bar-comments">
						<a class="ab-item" href={ commentsURL }>
							<span class="ab-icon" aria-hidden="true"></span>
							<span
								class={ `ab-label awaiting-mod pending-count count-${ pendingCommentsCount }` }
								aria-hidden="true"
							>
								{ pendingCommentsCount }
							</span>
							<span class="screen-reader-text comments-in-moderation-text">
								{ pendingCommentsCount + ' ' + translate( 'Comments in moderation' ) }
							</span>
						</a>
					</li>
					<Menupop id="wp-admin-bar-new-content">
						<a class="ab-item" aria-haspopup="true" href={ postEditorURL }>
							<span class="ab-icon" aria-hidden="true"></span>
							<span class="ab-label">{ translate( 'New' ) }</span>
						</a>
						<div class="ab-sub-wrapper">
							<ul id="wp-admin-bar-new-content-default" class="ab-submenu">
								<li id="wp-admin-bar-new-post">
									<a class="ab-item" href={ postEditorURL }>
										{ translate( 'Post' ) }
									</a>
								</li>
								<li id="wp-admin-bar-new-media">
									<a class="ab-item" href={ mediaURL }>
										{ translate( 'Media' ) }
									</a>
								</li>
								<li id="wp-admin-bar-new-page">
									<a class="ab-item" href={ pageEditorURL }>
										{ translate( 'Page' ) }
									</a>
								</li>
								<li id="wp-admin-bar-new-user">
									<a class="ab-item" href={ addUserURL }>
										{ translate( 'User' ) }
									</a>
								</li>
								<li id="wp-admin-bar-new-user">
									<a class="ab-item" href={ domainsURL }>
										{ translate( 'Domain' ) }
									</a>
								</li>
							</ul>
						</div>
					</Menupop>
				</ul>
				<ul id="wp-admin-bar-top-secondary" class="ab-top-secondary ab-top-menu">
					<Menupop
						id="wp-admin-bar-my-account"
						className={ classNames( { 'with-avatar': avatarURL } ) }
					>
						<a class="ab-item" aria-haspopup="true" href={ profileURL }>
							{ translate( 'Howdy, ' ) } <span class="display-name">{ userDisplayName }</span>
							{ avatarURL && (
								<img
									alt={ translate( 'Your avatar' ) }
									src={ avatarURL }
									class="avatar avatar-26 photo"
									height="26"
									width="26"
									loading="lazy"
									decoding="async"
								/>
							) }
						</a>
						<div class="ab-sub-wrapper">
							<ul id="wp-admin-bar-user-actions" class="ab-submenu">
								<li id="wp-admin-bar-user-info">
									<a class="ab-item" tabindex="-1" href={ profileURL }>
										{ avatarURL && (
											<img
												alt={ translate( 'Your avatar' ) }
												src={ avatarURL }
												class="avatar avatar-64 photo"
												height="64"
												width="64"
												loading="lazy"
												decoding="async"
											/>
										) }
									</a>
								</li>
								<li id="wp-admin-bar-edit-profile">
									<a class="ab-item" href={ profileURL }>
										{ translate( 'Edit Profile' ) }
									</a>
								</li>
								<li id="wp-admin-bar-edit-profile">
									<a class="ab-item" href={ accountSettingsURL }>
										{ translate( 'Account Settings' ) }
									</a>
								</li>
								<li id="wp-admin-bar-logout">
									<a class="ab-item" href={ logoutURL }>
										{ translate( 'Log Out' ) }
									</a>
								</li>
							</ul>
						</div>
					</Menupop>
					<li id="wp-admin-bar-wp-notifications">
						{ renderNotifications() }
						{ /* <a
							href=""
							class="ab-item"
							aria-haspopup="true"
							onClick={ () =>
								alert(
									"This should open the notification panel on the right side of the page, or redirect to the notifications page in reader if that doesn't work"
								)
							}
						>
							<span class="ab-icon" aria-hidden="true"></span>
						</a> */ }
					</li>
					<li id="wp-admin-bar-wp-help">
						{ renderHelpCenter() }
						{ /* <a
								href="#"
								class="ab-item"
								aria-haspopup="true"
								// onClick={ () =>
								// 	alert( 'This should open the help center popover on the right side of the page' )
								// }
							>
								<span class="ab-icon" aria-hidden="true"></span>
							</a> */ }
					</li>
				</ul>
			</div>
			<a class="screen-reader-shortcut" href={ logoutURL }>
				{ translate( 'Log Out' ) }
			</a>
		</div>
	);
}

export default WpAdminBar;
