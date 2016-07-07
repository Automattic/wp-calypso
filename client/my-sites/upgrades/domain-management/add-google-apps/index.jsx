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
	AddEmailAddressesCard = require( './add-email-addresses-card' ),
	paths = require( 'my-sites/upgrades/paths' ),
	{ hasGoogleAppsSupportedDomain } = require( 'lib/domains' ),
	SectionHeader = require( 'components/section-header' );

const AddGoogleApps = React.createClass( {
	componentDidMount() {
		this.ensureCanAddEmail();
	},

	componentDidUpdate() {
		this.ensureCanAddEmail();
	},

	ensureCanAddEmail() {
		const needsRedirect = (
			this.props.domains.hasLoadedFromServer &&
			! hasGoogleAppsSupportedDomain( this.props.domains.list )
		);

		if ( needsRedirect ) {
			const path = paths.domainManagementEmail(
				this.props.selectedSite.slug,
				this.props.selectedDomainName
			);

			page.replace( path );
		}
	},

	render() {
		return (
			<Main className="domain-management-add-google-apps">
				<Header
					onClick={ this.goToEmail }
					selectedDomainName={ this.props.selectedDomainName }>
					{ this.translate( 'Add Google Apps' ) }
				</Header>

				<SectionHeader label={ this.translate( 'Add Google Apps' ) } />

				<AddEmailAddressesCard
					domains={ this.props.domains }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ this.props.selectedSite } />
			</Main>
		);
	},

	goToEmail() {
		const path = paths.domainManagementEmail(
			this.props.selectedSite.slug,
			this.props.selectedDomainName
		);

		page( path );
	}
} );

module.exports = AddGoogleApps;
