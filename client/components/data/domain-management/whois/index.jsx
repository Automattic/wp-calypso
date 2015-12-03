/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var StoreConnection = require( 'components/data/store-connection' ),
	DomainsStore = require( 'lib/domains/store' ),
	WhoisStore = require( 'lib/domains/whois/store' ),
	observe = require( 'lib/mixins/data-observe' ),
	upgradesActions = require( 'lib/upgrades/actions' );

var stores = [
	DomainsStore,
	WhoisStore
];

function getStateFromStores( props ) {
	let domains;

	if ( props.selectedSite ) {
		domains = DomainsStore.getBySite( props.selectedSite.ID );
	}

	return {
		domains,
		whois: WhoisStore.getByDomainName( props.selectedDomainName ),
		products: props.products,
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite,
		context: props.context
	};
}

module.exports = React.createClass( {
	displayName: 'WhoisData',

	propTypes: {
		component: React.PropTypes.func.isRequired,
		context: React.PropTypes.object.isRequired,
		productsList: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		sites: React.PropTypes.object.isRequired
	},

	mixins: [ observe( 'productsList' ) ],

	componentWillMount() {
		this.loadDomains();
		this.loadWhois();
	},

	componentWillUpdate() {
		this.loadDomains();
		this.loadWhois();
	},

	loadDomains() {
		const selectedSite = this.props.sites.getSelectedSite();

		if ( this.prevSelectedSite !== selectedSite ) {
			upgradesActions.fetchDomains( selectedSite.ID );

			this.prevSelectedSite = selectedSite;
		}
	},

	loadWhois() {
		upgradesActions.fetchWhois( this.props.selectedDomainName );
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
				context={ this.props.context } />
		);
	}
} );
