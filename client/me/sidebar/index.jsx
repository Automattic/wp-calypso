/** @format */

/**
 * External dependencies
 */

import React from 'react';
import createReactClass from 'create-react-class';
import debugFactory from 'debug';
import { connect } from 'react-redux';
import { flow } from 'lodash';
import { localize } from 'i18n-calypso';

const debug = debugFactory( 'calypso:me:sidebar' );

/**
 * Internal dependencies
 */
import Sidebar from 'layout/sidebar';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarHeading from 'layout/sidebar/heading';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import config from 'config';
import ProfileGravatar from 'me/profile-gravatar';
import eventRecorder from 'me/event-recorder';
import userFactory from 'lib/user';
const user = userFactory();
import userUtilities from 'lib/user/utils';
import Button from 'components/button';
import purchasesPaths from 'me/purchases/paths';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { getCurrentUser } from 'state/current-user/selectors';
import { logoutUser } from 'state/login/actions';

const MeSidebar = createReactClass( {
	displayName: 'MeSidebar',
	mixins: [ eventRecorder ],

	componentDidMount: function() {
		debug( 'The MeSidebar React component is mounted.' );
	},

	onNavigate: function() {
		this.props.setNextLayoutFocus( 'content' );
		window.scrollTo( 0, 0 );
	},

	onSignOut: function() {
		const currentUser = this.props.currentUser;

		// If user is using en locale, redirect to app promo page on sign out
		const isEnLocale = currentUser && currentUser.localeSlug === 'en';
		let redirect = null;
		if ( isEnLocale && ! config.isEnabled( 'desktop' ) ) {
			redirect = '/?apppromo';
		}

		if ( config.isEnabled( 'login/wp-login' ) ) {
			this.props.logoutUser( redirect ).then(
				( { redirect_to } ) => user.clear( () => ( location.href = redirect_to || '/' ) ),
				// The logout endpoint might fail if the nonce has expired.
				// In this case, redirect to wp-login.php?action=logout to get a new nonce generated
				() => userUtilities.logout( redirect )
			);
		} else {
			userUtilities.logout( redirect );
		}

		this.recordClickEvent( 'Sidebar Sign Out Link' );
	},

	render: function() {
		const { context, translate } = this.props;
		const filterMap = {
			'/me': 'profile',
			'/me/security/account-recovery': 'security',
			'/me/security/connected-applications': 'security',
			'/me/security/social-login': 'security',
			'/me/security/two-step': 'security',
			'/me/notifications/comments': 'notifications',
			'/me/notifications/updates': 'notifications',
			'/me/notifications/subscriptions': 'notifications',
			'/help/contact': 'help',
			[ purchasesPaths.purchasesRoot() ]: 'purchases',
			[ purchasesPaths.billingHistory() ]: 'purchases',
			[ purchasesPaths.addCreditCard() ]: 'purchases',
			'/me/chat': 'happychat',
		};
		const filteredPath = context.path.replace( /\/\d+$/, '' ); // Remove ID from end of path
		let selected;

		/*
		 * Determine currently-active path to use for 'selected' menu highlight
		 *
		 * Most routes within /me follow the pattern of `/me/{selected}`. But, there are a few unique cases.
		 * filterMap is an object that maps those special cases to the correct selected value.
		 */
		if ( filterMap[ filteredPath ] ) {
			selected = filterMap[ filteredPath ];
		} else {
			selected = context.path.split( '/' ).pop();
		}

		return (
			<Sidebar>
				<ProfileGravatar user={ this.props.currentUser } />
				<div className="me-sidebar__signout">
					<Button
						compact
						className="me-sidebar__signout-button"
						onClick={ this.onSignOut }
						title={ translate( 'Sign out of WordPress.com', { textOnly: true } ) }
					>
						{ translate( 'Sign Out' ) }
					</Button>
				</div>
				<SidebarMenu>
					<SidebarHeading>{ translate( 'Profile' ) }</SidebarHeading>
					<ul>
						<SidebarItem
							selected={ selected === 'profile' }
							link={
								config.isEnabled( 'me/my-profile' ) ? '/me' : '//wordpress.com/me/public-profile'
							}
							label={ translate( 'My Profile' ) }
							icon="user"
							onNavigate={ this.onNavigate }
						/>

						<SidebarItem
							selected={ selected === 'account' }
							link={
								config.isEnabled( 'me/account' ) ? '/me/account' : '//wordpress.com/me/account'
							}
							label={ translate( 'Account Settings' ) }
							icon="cog"
							onNavigate={ this.onNavigate }
							preloadSectionName="account"
						/>

						<SidebarItem
							selected={ selected === 'purchases' }
							link={ purchasesPaths.purchasesRoot() }
							label={ translate( 'Manage Purchases' ) }
							icon="credit-card"
							onNavigate={ this.onNavigate }
							preloadSectionName="purchases"
						/>

						<SidebarItem
							selected={ selected === 'security' }
							link={ '/me/security' }
							label={ translate( 'Security' ) }
							icon="lock"
							onNavigate={ this.onNavigate }
							preloadSectionName="security"
						/>

						<SidebarItem
							selected={ selected === 'notifications' }
							link={
								config.isEnabled( 'me/notifications' )
									? '/me/notifications'
									: '//wordpress.com/me/notifications'
							}
							label={ translate( 'Notification Settings' ) }
							icon="bell"
							onNavigate={ this.onNavigate }
							preloadSectionName="notification-settings"
						/>
					</ul>
				</SidebarMenu>
				<SidebarMenu>
					<SidebarHeading>{ translate( 'Special' ) }</SidebarHeading>
					<ul>
						<SidebarItem
							selected={ selected === 'get-apps' }
							link={ '/me/get-apps' }
							label={ translate( 'Get Apps' ) }
							icon="my-sites"
							onNavigate={ this.onNavigate }
						/>
						{ this.renderNextStepsItem( selected ) }
					</ul>
				</SidebarMenu>
				<SidebarFooter />
			</Sidebar>
		);
	},

	renderNextStepsItem: function( selected ) {
		const { currentUser, translate } = this.props;

		if ( config.isEnabled( 'me/next-steps' ) && currentUser && currentUser.site_count > 0 ) {
			return (
				<SidebarItem
					selected={ selected === 'next' }
					link="/me/next"
					label={ translate( 'Next Steps' ) }
					icon="list-checkmark"
					onNavigate={ this.onNavigate }
				/>
			);
		}
	},
} );

const enhance = flow(
	localize,
	connect(
		state => ( {
			currentUser: getCurrentUser( state ),
		} ),
		{
			logoutUser,
			setNextLayoutFocus,
		}
	)
);

export default enhance( MeSidebar );
