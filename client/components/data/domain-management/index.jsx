/**
 * External dependencies
 */
var connect = require( 'react-redux' ).connect,
	React = require( 'react' );

/**
 * Internal dependencies
 */
var StoreConnection = require( 'components/data/store-connection' ),
	DomainsStore = require( 'lib/domains/store' ),
	CartStore = require( 'lib/cart/store' ),
	observe = require( 'lib/mixins/data-observe' ),
	upgradesActions = require( 'lib/upgrades/actions' ),
	fetchSitePlans = require( 'state/sites/plans/actions' ).fetchSitePlans,
	shouldFetchSitePlans = require( 'lib/plans' ).shouldFetchSitePlans,
	getPlansBySite = require( 'state/sites/plans/selectors' ).getPlansBySite;

var stores = [
	DomainsStore,
	CartStore
];

function getStateFromStores( props ) {
	return {
		cart: CartStore.get(),
		context: props.context,
		domains: ( props.selectedSite ? DomainsStore.getBySite( props.selectedSite.ID ) : null ),
		products: props.products,
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite,
		sitePlans: props.sitePlans
	};
}

var DomainManagementData = React.createClass( {
	propTypes: {
		context: React.PropTypes.object.isRequired,
		productsList: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string,
		sites: React.PropTypes.object.isRequired,
		sitePlans: React.PropTypes.object.isRequired
	},

	mixins: [ observe( 'productsList' ) ],

	componentWillMount: function() {
		if ( this.props.sites.getSelectedSite() ) {
			upgradesActions.fetchDomains( this.props.sites.getSelectedSite().ID );
			this.props.fetchSitePlans( this.props.sitePlans, this.props.sites.getSelectedSite() );
		}

		this.prevSelectedSite = this.props.sites.getSelectedSite();
	},

	componentWillUpdate: function() {
		if ( this.prevSelectedSite !== this.props.sites.getSelectedSite() ) {
			upgradesActions.fetchDomains( this.props.sites.getSelectedSite().ID );
			this.props.fetchSitePlans( this.props.sitePlans, this.props.sites.getSelectedSite() );
		}

		this.prevSelectedSite = this.props.sites.getSelectedSite();
	},

	render: function() {
		return (
			<StoreConnection
				component={ this.props.component }
				stores={ stores }
				getStateFromStores={ getStateFromStores }
				products={ this.props.productsList.get() }
				selectedDomainName={ this.props.selectedDomainName }
				selectedSite={ this.props.sites.getSelectedSite() }
				sitePlans={ this.props.sitePlans }
				context={ this.props.context } />
		);
	}
} );

module.exports = connect(
	function( state, props ) {
		return {
			sitePlans: getPlansBySite( state, props.sites.getSelectedSite() )
		}
	},
	function( dispatch ) {
		return {
			fetchSitePlans: ( sitePlans, site ) => {
				if ( shouldFetchSitePlans( sitePlans, site ) ) {
					dispatch( fetchSitePlans( site.ID ) );
				}
			}
		}
	}
)( DomainManagementData );
