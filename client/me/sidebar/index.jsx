/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:sidebar' );

/**
 * Internal dependencies
 */
var MenuItem = require( './sidebar-item' ),
	config = require( 'config' ),
	ProfileGravatar = require( 'me/profile-gravatar' ),
	eventRecorder = require( 'me/event-recorder' ),
	observe = require( 'lib/mixins/data-observe' ),
	FormButton = require( 'components/forms/form-button' ),
	userUtilities = require( 'lib/user/utils' );

module.exports = React.createClass( {

	displayName: 'MeSidebar',

	mixins: [ eventRecorder, observe( 'user' ) ],

	componentDidMount: function() {
		debug( 'The MeSidebar React component is mounted.' );
	},

	render: function() {
		var context = this.props.context,
			filterMap = {
				'/me': 'profile',
				'/me/security/two-step': 'security',
				'/me/security/connected-applications': 'security',
				'/me/security/checkup': 'security',
				'/me/notifications/comments': 'notifications',
				'/me/notifications/updates': 'notifications',
				'/me/notifications/subscriptions': 'notifications',
				'/help/contact': 'help',
				'/purchases': 'billing',
				'/me/billing': 'billing'
			},
			filteredPath = context.path.replace( /\/\d+$/, '' ), // Remove ID from end of path
			selected;

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
			<div className="me-sidebar__menu">
				<ul className="wpcom-sidebar sidebar">

					<ProfileGravatar user={ this.props.user.get() } />

					<FormButton
						className="me-sidebar__menu__signout"
						isPrimary={false}
						onClick={ this.recordClickEvent( 'Sidebar Sign Out Link', userUtilities.logout ) }
						title={ this.translate( 'Sign out of WordPress.com', { textOnly: true } ) }
					>
						{ this.translate( 'Sign Out' ) }
					</FormButton>

					<li className="sidebar-menu me-profile">
						<h2 className="sidebar-heading">{ this.translate( 'Profile' ) }</h2>
						<ul>
							<MenuItem
								selected={ selected === 'profile' }
								href={ config.isEnabled( 'me/my-profile' ) ? '/me' : '//wordpress.com/me/public-profile' }
								label={ this.translate( 'My Profile' ) }
								icon="user"
							/>

							<MenuItem
								selected={ selected === 'account' }
								href={ config.isEnabled( 'me/account' ) ? '/me/account' : '//wordpress.com/me/account' }
								label={ this.translate( 'Account Settings' ) }
								icon="cog"
							/>

							{ config.isEnabled( 'upgrades/purchases/list' )
								? <MenuItem
									selected={ selected === 'billing' }
									href="/purchases"
									label={ this.translate( 'Manage Purchases' ) }
									icon="credit-card"
								/>
								: <MenuItem
									selected={ selected === 'billing' }
									href={ config.isEnabled( 'me/billing-history' ) ? '/me/billing' : '//wordpress.com/me/billing' }
									label={ this.translate( 'Billing History' ) }
									icon="credit-card"
								/>
							}

							<MenuItem
								selected={ selected === 'security' }
								href={ config.isEnabled( 'me/security' ) ? '/me/security' : '//wordpress.com/me/security' }
								label={ this.translate( 'Security' ) }
								icon="lock"
							/>

							<MenuItem
								selected={ selected === 'notifications' }
								href={ config.isEnabled( 'me/notifications' ) ? '/me/notifications' : '//wordpress.com/me/notifications' }
								label={ this.translate( 'Notifications' ) }
								icon="bell"
							/>

						</ul>
					</li>
					<li className="sidebar-menu me-extras">
						<h2 className="sidebar-heading">{ this.translate( 'Special' ) }</h2>
						<ul>
							{ this.renderNextStepsItem( selected ) }
							<MenuItem
								selected={ selected === 'help' }
								href={ config.isEnabled( 'help' ) ? '/help' : '//support.wordpress.com' }
								label={ this.translate( 'Help' ) }
								external={ config.isEnabled( 'help' ) ? 'false' : 'true' }
								icon="help-outline"
							/>
						</ul>
					</li>
				</ul>
			</div>
		);
	},

	renderNextStepsItem: function( selected ) {
		var currentUser = this.props.user.get();
		if ( config.isEnabled( 'me/next-steps' ) && currentUser && currentUser.site_count > 0 ) {
			return (
				<MenuItem
					selected={ selected === 'next' }
					href="/me/next"
					label={ this.translate( 'Next Steps' ) }
					icon="list-checkmark"
				/>
			);
		}
	}
} );
