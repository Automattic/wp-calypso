/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var StoreConnection = require( 'components/data/store-connection' ),
	DomainsStore = require( 'lib/domains/store' ),
	CartStore = require( 'lib/cart/store' ),
	observe = require( 'lib/mixins/data-observe' ),
	upgradesActions = require( 'lib/upgrades/actions' );

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
		selectedSite: props.selectedSite
	};
}

module.exports = React.createClass( {
	displayName: 'DomainManagementData',

	propTypes: {
		context: React.PropTypes.object.isRequired,
		productsList: React.PropTypes.object.isRequired,
		sites: React.PropTypes.object.isRequired
	},

	mixins: [ observe( 'productsList' ) ],

	componentWillMount: function() {
		if ( this.props.sites.getSelectedSite() ) {
			upgradesActions.fetchDomains( this.props.sites.getSelectedSite().ID );
		}

		this.prevSelectedSite = this.props.sites.getSelectedSite();
	},

	componentWillUpdate: function() {
		if ( this.prevSelectedSite !== this.props.sites.getSelectedSite() ) {
			upgradesActions.fetchDomains( this.props.sites.getSelectedSite().ID );
		}

		this.prevSelectedSite = this.props.sites.getSelectedSite();
	},

	render: function() {
		return (
			<StoreConnection
				stores={ stores }
				getStateFromStores={ getStateFromStores }
				products={ this.props.productsList.get() }
				selectedSite={ this.props.sites.getSelectedSite() }
				context={ this.props.context }>
				{ this.props.children }
			</StoreConnection>
		);
	}
} );
