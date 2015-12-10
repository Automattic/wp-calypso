/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var StoreConnection = require( 'components/data/store-connection' ),
	SiteRedirectStore = require( 'lib/domains/site-redirect/store' ),
	observe = require( 'lib/mixins/data-observe' );

var stores = [
	SiteRedirectStore
];

function getStateFromStores( props ) {
	return {
		location: SiteRedirectStore.getBySite( props.selectedSite.domain ),
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite
	};
}

module.exports = React.createClass( {
	displayName: 'SiteRedirectData',

	propTypes: {
		component: React.PropTypes.func.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		sites: React.PropTypes.object.isRequired
	},

	mixins: [ observe( 'sites' ) ],

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
