/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:sidebar' );

/**
 * Internal dependencies
 */
var Sidebar = require( 'layout/sidebar' ),
	SidebarHeading = require( 'layout/sidebar/heading' ),
	SidebarItem = require( 'layout/sidebar/item' ),
	SidebarMenu = require( 'layout/sidebar/menu' ),
	config = require( 'config' ),
	layoutFocus = require( 'lib/layout-focus' ),
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

	onNavigate: function() {
		layoutFocus.setNext( 'content' );
		window.scrollTo( 0, 0 );
	},

	onSignOut: function() {
		const currentUser = this.props.user.get();
		
		// If user is using en locale, redirect to app promo page on sign out
		const isEnLocale = ( currentUser && currentUser.localeSlug === 'en' );
		let redirect = null;
		if ( isEnLocale && !config.isEnabled( 'desktop' ) ) {
			redirect = '/?apppromo';
		}
		userUtilities.logout( redirect );
		this.recordClickEvent( 'Sidebar Sign Out Link' );
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
			<Sidebar>
				<ProfileGravatar user={ this.props.user.get() } />
				<FormButton
					className="me-sidebar__menu__signout"
					isPrimary={ false }
					onClick={ this.onSignOut }
					title={ this.translate( 'Sign out of WordPress.com', { textOnly: true } ) }
				>
					{ this.translate( 'Sign Out' ) }
				</FormButton>
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
						/>

						<SidebarItem
							selected={ selected === 'billing' }
							link="/purchases"
							label={ this.translate( 'Manage Purchases' ) }
							icon="credit-card"
							onNavigate={ this.onNavigate }
						/>

						<SidebarItem
							selected={ selected === 'security' }
							link={ config.isEnabled( 'me/security' ) ? '/me/security' : '//wordpress.com/me/security' }
							label={ this.translate( 'Security' ) }
							icon="lock"
							onNavigate={ this.onNavigate }
						/>

						<SidebarItem
							selected={ selected === 'notifications' }
							link={ config.isEnabled( 'me/notifications' ) ? '/me/notifications' : '//wordpress.com/me/notifications' }
							label={ this.translate( 'Notifications' ) }
							icon="bell"
							onNavigate={ this.onNavigate }
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
						/>
					</ul>
				</SidebarMenu>
			</Sidebar>
		);
	},

	renderNextStepsItem: function( selected ) {
		var currentUser = this.props.user.get();
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
