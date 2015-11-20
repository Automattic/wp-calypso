/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var StoreConnection = require( 'components/data/store-connection' ),
	DomainsStore = require( 'lib/domains/store' ),
	GoogleAppsUsersStore = require( 'lib/domains/google-apps-users/store' ),
	CartStore = require( 'lib/cart/store' ),
	observe = require( 'lib/mixins/data-observe' ),
	upgradesActions = require( 'lib/upgrades/actions' );

var stores = [
	DomainsStore,
	GoogleAppsUsersStore,
	CartStore
];

function getStateFromStores( props ) {
	let domains;

	if ( props.selectedSite ) {
		domains = DomainsStore.getForSite( props.selectedSite.ID );
	}

	return {
		domains,
		cart: CartStore.get(),
		context: props.context,
		products: props.products,
		googleAppsUsers: GoogleAppsUsersStore.getByDomainName( props.selectedDomainName ),
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite,
		user: props.user
	};
}

module.exports = React.createClass( {
	displayName: 'EmailData',

	propTypes: {
		component: React.PropTypes.func.isRequired,
		context: React.PropTypes.object.isRequired,
		productsList: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string,
		sites: React.PropTypes.object.isRequired,
		user: React.PropTypes.object.isRequired
	},

	mixins: [ observe( 'productsList', 'sites' ) ],

	componentWillMount() {
		this.loadDomains();
	},

	componentWillUpdate() {
		this.loadDomains();
	},

	loadDomains() {
		const selectedSite = this.props.sites.getSelectedSite();

		if ( this.prevSelectedSite !== selectedSite ) {
			upgradesActions.fetchDomains( selectedSite.ID );

			this.prevSelectedSite = selectedSite;
		}
	},

	render() {
		return (
			<StoreConnection
				component={ this.props.component }
				stores={ stores }
				getStateFromStores={ getStateFromStores }
				products={ this.props.productsList.get() }
				selectedDomainName={ this.props.selectedDomainName }
				selectedSite={ this.props.sites.getSelectedSite() }
				context={ this.props.context }
				user={ this.props.user }>
				{ this.props.children }
			</StoreConnection>
		);
	}
} );
