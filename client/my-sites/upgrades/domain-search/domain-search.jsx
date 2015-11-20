/**
 * External dependencies
 */
var page = require( 'page' ),
	React = require( 'react' ),
	classnames = require( 'classnames' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	EmptyContent = require( 'components/empty-content' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	RegisterDomainStep = require( 'components/domains/register-domain-step' ),
	UpgradesNavigation = require( 'my-sites/upgrades/navigation' ),
	Main = require( 'components/main' );

module.exports = React.createClass( {
	displayName: 'DomainSearch',

	mixins: [ observe( 'productsList', 'sites' ) ],

	propTypes: {
		sites: React.PropTypes.object.isRequired,
		productsList: React.PropTypes.object.isRequired,
		basePath: React.PropTypes.string.isRequired
	},

	getInitialState: function() {
		return { domainRegistrationAvailable: true };
	},

	componentWillMount: function() {
		this.checkSiteIsUpgradeable();
	},

	componentDidMount: function() {
		this.props.sites.on( 'change', this.checkSiteIsUpgradeable );
	},

	componentWillUnmount: function() {
		this.props.sites.off( 'change', this.checkSiteIsUpgradeable );
	},

	checkSiteIsUpgradeable: function() {
		var selectedSite = this.props.sites.getSelectedSite();

		if ( selectedSite && ! selectedSite.isUpgradeable() ) {
			page.redirect( '/domains/add' );
		}
	},

	handleDomainsAvailabilityChange: function( isAvailable ) {
		this.setState( { domainRegistrationAvailable: isAvailable } );
	},

	render: function() {
		var selectedSite = this.props.sites.getSelectedSite(),
			classes = classnames( 'main-column', {
				'domain-search-page-wrapper': this.state.domainRegistrationAvailable
			} ),
			content;

		if ( ! this.state.domainRegistrationAvailable ) {
			content = (
				<EmptyContent
					illustration='/calypso/images/drake/drake-500.svg'
					title={ this.translate( 'Domain registration is unavailable' ) }
					line={ this.translate( "We're hard at work on the issue. Please check back shortly." ) }
					action={ this.translate( 'Back to Plans' ) }
					actionURL={ '/plans/' + selectedSite.slug } />
			);
		} else {
			content = (
				<div className="domain-search__content">
					<UpgradesNavigation
						path={ this.props.context.path }
						cart={ this.props.cart }
						selectedSite={ selectedSite } />

					<RegisterDomainStep
						path={ this.props.context.path }
						onDomainsAvailabilityChange={ this.handleDomainsAvailabilityChange }
						cart={ this.props.cart }
						selectedSite={ selectedSite }
						offerMappingOption
						basePath={ this.props.basePath }
						products={ this.props.productsList.get() } />
				</div>
			);
		}

		return (
			<Main className={ classes }>
				<SidebarNavigation />
				{ content }
			</Main>
		);
	}
} );
