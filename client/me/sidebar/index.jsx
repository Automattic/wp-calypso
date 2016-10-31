/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';
import { connect } from 'react-redux';

const debug = debugFactory( 'calypso:me:sidebar' );

/**
 * Internal dependencies
 */
const Sidebar = require( 'layout/sidebar' ),
	SidebarFooter = require( 'layout/sidebar/footer' ),
	SidebarHeading = require( 'layout/sidebar/heading' ),
	SidebarItem = require( 'layout/sidebar/item' ),
	SidebarMenu = require( 'layout/sidebar/menu' ),
	config = require( 'config' ),
	ProfileGravatar = require( 'me/profile-gravatar' ),
	eventRecorder = require( 'me/event-recorder' ),
	userUtilities = require( 'lib/user/utils' );

import Button from 'components/button';
import purchasesPaths from 'me/purchases/paths';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { getCurrentUser } from 'state/current-user/selectors';
import { isHappychatAvailable } from 'state/happychat/selectors';

const MeSidebar = React.createClass( {

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
		const isEnLocale = ( currentUser && currentUser.localeSlug === 'en' );
		let redirect = null;
		if ( isEnLocale && ! config.isEnabled( 'desktop' ) ) {
			redirect = '/?apppromo';
		}
		userUtilities.logout( redirect );
		this.recordClickEvent( 'Sidebar Sign Out Link' );
	},

	render: function() {
		const { context } = this.props;
		const filterMap = {
			'/me': 'profile',
			'/me/security/two-step': 'security',
			'/me/security/connected-applications': 'security',
			'/me/security/checkup': 'security',
			'/me/notifications/comments': 'notifications',
			'/me/notifications/updates': 'notifications',
			'/me/notifications/subscriptions': 'notifications',
			'/help/contact': 'help',
			[ purchasesPaths.purchasesRoot() ]: 'purchases',
			[ purchasesPaths.billingHistory() ]: 'purchases',
			[ purchasesPaths.addCreditCard() ]: 'purchases',
			'/me/chat': 'happychat'
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
						title={ this.translate( 'Sign out of WordPress.com', { textOnly: true } ) }
					>
						{ this.translate( 'Sign Out' ) }
					</Button>
				</div>
				<SidebarMenu>
					<SidebarHeading>{ this.translate( 'Profile' ) }</SidebarHeading>
					<ul>
						<SidebarItem
							selected={ selected === 'profile' }
							link={ config.isEnabled( 'me/my-profile' ) ? '/me' : '//wordpress.com/me/public-profile' }
							label={ this.translate( 'My Profile' ) }
							icon="user"
							onNavigate={ this.onNavigate }
						/>

						<SidebarItem
							selected={ selected === 'account' }
							link={ config.isEnabled( 'me/account' ) ? '/me/account' : '//wordpress.com/me/account' }
							label={ this.translate( 'Account Settings' ) }
							icon="cog"
							onNavigate={ this.onNavigate }
							preloadSectionName="account"
						/>

						<SidebarItem
							selected={ selected === 'purchases' }
							link={ purchasesPaths.purchasesRoot() }
							label={ this.translate( 'Manage Purchases' ) }
							icon="credit-card"
							onNavigate={ this.onNavigate }
							preloadSectionName="purchases"
						/>

						<SidebarItem
							selected={ selected === 'security' }
							link={ config.isEnabled( 'me/security' ) ? '/me/security' : '//wordpress.com/me/security' }
							label={ this.translate( 'Security' ) }
							icon="lock"
							onNavigate={ this.onNavigate }
							preloadSectionName="security"
						/>

						<SidebarItem
							selected={ selected === 'notifications' }
							link={ config.isEnabled( 'me/notifications' ) ? '/me/notifications' : '//wordpress.com/me/notifications' }
							label={ this.translate( 'Notifications' ) }
							icon="bell"
							onNavigate={ this.onNavigate }
							preloadSectionName="notification-settings"
						/>

					</ul>
				</SidebarMenu>
				<SidebarMenu>
					<SidebarHeading>{ this.translate( 'Special' ) }</SidebarHeading>
					<ul>
						<SidebarItem
							selected={ selected === 'get-apps' }
							link={ '/me/get-apps' }
							label={ this.translate( 'Get Apps' ) }
							icon="my-sites"
							onNavigate={ this.onNavigate }
						/>
						{ this.renderNextStepsItem( selected ) }
						<SidebarItem
							selected={ selected === 'help' }
							link={ config.isEnabled( 'help' ) ? '/help' : '//support.wordpress.com' }
							label={ this.translate( 'Help' ) }
							external={ config.isEnabled( 'help' ) ? 'false' : 'true' }
							icon="help-outline"
							onNavigate={ this.onNavigate }
							preloadSectionName="help"
						/>
					</ul>
				</SidebarMenu>
				<SidebarFooter />
			</Sidebar>
		);
	},

	renderNextStepsItem: function( selected ) {
		const currentUser = this.props.currentUser;
		if ( config.isEnabled( 'me/next-steps' ) && currentUser && currentUser.site_count > 0 ) {
			return (
				<SidebarItem
					selected={ selected === 'next' }
					link="/me/next"
					label={ this.translate( 'Next Steps' ) }
					icon="list-checkmark"
					onNavigate={ this.onNavigate }
				/>
			);
		}
	}
} );

function mapStateToProps( state ) {
	return {
		currentUser: getCurrentUser( state ),
		isHappychatAvailable: isHappychatAvailable( state )
	};
}

export default connect( mapStateToProps, { setNextLayoutFocus } )( MeSidebar );
