/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var StoreConnection = require( 'components/data/store-connection' ),
	DnsStore = require( 'lib/domains/dns/store' ),
	DomainsStore = require( 'lib/domains/store' ),
	observe = require( 'lib/mixins/data-observe' ),
	upgradesActions = require( 'lib/upgrades/actions' );

const stores = [
	DomainsStore,
	DnsStore
];

function getStateFromStores( props ) {
	let domains;

	if ( props.selectedSite ) {
		domains = DomainsStore.getBySite( props.selectedSite.ID );
	}

	return {
		domains,
		dns: DnsStore.getByDomainName( props.selectedDomainName ),
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite
	};
}

module.exports = React.createClass( {
	displayName: 'DnsData',

	propTypes: {
		component: React.PropTypes.func.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		sites: React.PropTypes.object.isRequired
	},

	mixins: [ observe( 'sites' ) ],

	componentWillMount() {
		this.loadDns();
	},

	componentWillUpdate() {
		this.loadDns();
	},

	loadDns() {
		upgradesActions.fetchDns( this.props.selectedDomainName );
	},

	render() {
		return (
			<StoreConnection
				component={ this.props.component }
				stores={ stores }
				getStateFromStores={ getStateFromStores }
				selectedDomainName={ this.props.selectedDomainName }
				selectedSite={ this.props.sites.getSelectedSite() } />
		);
	}
} );
