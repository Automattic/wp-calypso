/**
 * External dependencies
 */
const React = require( 'react' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
const Main = require( 'components/main' ),
	Header = require( 'my-sites/upgrades/domain-management/components/header' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	AddGoogleAppsCard = require( './add-google-apps-card' ),
	GoogleAppsUsersCard = require( './google-apps-users-card' ),
	VerticalNav = require( 'components/vertical-nav' ),
	VerticalNavItem = require( 'components/vertical-nav/item' ),
	UpgradesNavigation = require( 'my-sites/upgrades/navigation' ),
	EmptyContent = require( 'components/empty-content' ),
	paths = require( 'my-sites/upgrades/paths' ),
	{ hasGoogleApps, canAddEmail, getSelectedDomain } = require( 'lib/domains' );

const Email = React.createClass( {
	propTypes: {
		domains: React.PropTypes.object.isRequired,
		products: React.PropTypes.object.isRequired,
		googleAppsUsers: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		user: React.PropTypes.object.isRequired
	},

	hasGoogleApps() {
		return hasGoogleApps( getSelectedDomain( this.props ) );
	},

	render() {
		return (
			<Main className="domain-management-email">
				<SidebarNavigation />
				{ this.headerOrUpgradesNavigation() }
				{ this.content() }
				{ this.verticalNav() }
			</Main>
		);
	},

	headerOrUpgradesNavigation() {
		let component;

		if ( this.isManageDomainFlow() ) {
			component = (
				<Header
						onClick={ this.goToEditOrList }
						selectedDomainName={ this.props.selectedDomainName }>
					{ this.translate( 'Email' ) }
				</Header>
			);
		} else {
			component = (
				<UpgradesNavigation
					path={ this.props.context.path }
					cart={ this.props.cart }
					selectedSite={ this.props.selectedSite } />
			);
		}

		return component;
	},

	isManageDomainFlow() {
		return !! this.props.selectedDomainName;
	},

	content() {
		let component;

		if ( ! this.props.domains.hasLoadedFromServer ) {
			component = this.translate( 'Loading…' );
		} else if ( this.isManageDomainFlow() ) {
			if ( this.hasGoogleApps() ) {
				component = this.googleAppsUsersCard();
			} else if ( canAddEmail( [ getSelectedDomain( this.props ) ] ) ) {
				component = this.addGoogleAppsCard();
			}
		} else if ( canAddEmail( this.props.domains.list ) ) {
			component = this.addGoogleAppsCard();
		} else {
			component = this.emptyContent();
		}

		return component;
	},

	emptyContent() {
		return (
			<EmptyContent
				title={ this.translate( "You don't have any domains {{em}}yet{{/em}}.", {
					components: { em: <em /> }
				} ) }
				line={ this.translate( 'Add a domain to your site to make it easier ' +
					'to remember and easier to share, and get access to email ' +
					'forwarding, Google Apps for Work, and other email services.' ) }
				action={ this.translate( 'Add a Custom Domain' ) }
				actionURL={ '/domains/add/' + this.props.selectedSite.domain }
				illustration="/calypso/images/drake/drake-whoops.svg" />
		);
	},

	googleAppsUsersCard() {
		return (
			<GoogleAppsUsersCard
				googleAppsUsers={ this.props.googleAppsUsers }
				selectedSite={ this.props.selectedSite }
				selectedDomainName={ this.props.selectedDomainName }
				domains={ this.props.domains }
				user={ this.props.user } />
		);
	},

	addGoogleAppsCard() {
		return (
			<AddGoogleAppsCard
				products={ this.props.products }
				selectedSite={ this.props.selectedSite }
				selectedDomainName={ this.props.selectedDomainName } />
		);
	},

	isVerticalNavShowing() {
		return (
			this.isManageDomainFlow() &&
			this.props.domains.hasLoadedFromServer &&
			! this.hasGoogleApps()
		);
	},

	verticalNav() {
		if ( ! this.isVerticalNavShowing() ) {
			return null;
		}

		return (
			<VerticalNav>
				<VerticalNavItem path={ paths.domainManagementEmailForwarding( this.props.selectedSite.domain, this.props.selectedDomainName ) }>
					{ this.translate( 'Email Forwarding' ) }
				</VerticalNavItem>
			</VerticalNav>
		);
	},

	goToEditOrList() {
		let path;

		if ( this.isManageDomainFlow() ) {
			path = paths.domainManagementEdit( this.props.selectedSite.domain, this.props.selectedDomainName );
		} else {
			path = paths.domainManagementList( this.props.selectedSite.domain );
		}

		page( path );
	}
} );

module.exports = Email;
