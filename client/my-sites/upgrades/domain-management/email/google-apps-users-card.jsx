/**
 * External dependencies
 */
const React = require( 'react' ),
	defer = require( 'lodash/function/defer' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
const CompactCard = require( 'components/card/compact' ),
	upgradesActions = require( 'lib/upgrades/actions' ),
	paths = require( 'my-sites/upgrades/paths' ),
	Notice = require( 'notices/notice' ),
	analyticsMixin = require( 'lib/mixins/analytics' ),
	{ getSelectedDomain } = require( 'lib/domains' ),
	SectionHeader = require( 'components/section-header' );

const GoogleAppsUsersCard = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'googleApps' ) ],

	propTypes: {
		domains: React.PropTypes.object.isRequired,
		googleAppsUsers: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		user: React.PropTypes.object.isRequired
	},

	componentWillMount() {
		// NOTE: There is an error about dispatching during another dispatch unless
		//   we wrap this in a `defer`.
		defer( () => {
			upgradesActions.fetchGoogleAppsUsers( this.props.selectedDomainName );
		} );
	},

	render() {
		return (
			<div>
				{ this.header() }
				<CompactCard className="google-apps-users-card">
					{ this.subtext() }
					{ this.notice() }
					{ this.userList() }
					{ this.canAddUsers() ? this.addUsersButton() : null }
				</CompactCard>
			</div>
		);
	},

	canAddUsers() {
		let { googleAppsSubscription } = getSelectedDomain( this.props );
		return googleAppsSubscription.ownedByUserId === this.props.user.ID;
	},

	header() {
		return (
			<SectionHeader label={ this.translate( 'Google Apps' ) } />
		);
	},

	subtext() {
		return (
			<h4 className="google-apps-users-card__subtext">
				{ this.translate( 'Professional email, online storage, shared calendars, video meetings, & more.' ) }
			</h4>
		);
	},

	userList() {
		if ( ! this.props.googleAppsUsers.hasLoadedFromServer ) {
			return this.translate( 'Loading…' );
		}

		return (
			<ul className="google-apps-users-card__user-list">
				{ this.props.googleAppsUsers.value.map( this.userItem ) }
			</ul>
		);
	},

	userItem( user ) {
		return (
			<li key={ user }>
				<span className="google-apps-users-card__user-email">
					{ user }
				</span>

				<a
					className="google-apps-users-card__user-manage-link"
					href="https://admin.google.com"
					target="_blank"
					onClick={ this.handleManageClick( user ) }>
					{ this.translate( 'Manage', { context: 'Google Apps user item' } ) }
				</a>
			</li>
		);
	},

	handleManageClick( user ) {
		return () => {
			this.recordEvent( 'manageClick', this.props.selectedDomainName, user );
		};
	},

	notice() {
		return (
			<Notice
				className="google-apps-users-card__notice"
				text={ this.translate( 'Add more Google Apps users for {{strong}}$50 per user / year{{/strong}}, billed annually.', {
					components: {
						strong: <strong />
					}
				} ) }
				showDismiss={ false } />
		);
	},

	addUsersButton() {
		return (
			<button
				className="google-apps-users-card__add-user-button button is-primary"
				onClick={ this.goToAddGoogleApps }>
				{ this.translate( 'Add Google Apps User' ) }
			</button>
		);
	},

	goToAddGoogleApps( event ) {
		event.preventDefault();

		this.recordEvent( 'addGoogleAppsUserClick', this.props.selectedDomainName );

		page( paths.domainManagementAddGoogleApps(
			this.props.selectedSite.domain,
			this.props.selectedDomainName
		) );
	}
} );

module.exports = GoogleAppsUsersCard;
