/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React from 'react';

/**
 * Internal dependencies
 */
import StoreConnection from 'components/data/store-connection';
import DomainsStore from 'lib/domains/store';
import CartStore from 'lib/cart/store';
import observe from 'lib/mixins/data-observe';
import * as upgradesActions from 'lib/upgrades/actions';
import QuerySitePlans from 'components/data/query-site-plans';
import { getPlansBySite } from 'state/sites/plans/selectors';

const stores = [
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

const DomainManagementData = React.createClass( {
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
		const selectedSite = this.props.sites.getSelectedSite();
		return (
			<div>
				<StoreConnection
					component={ this.props.component }
					stores={ stores }
					getStateFromStores={ getStateFromStores }
					products={ this.props.productsList.get() }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ this.props.sites.getSelectedSite() }
					sitePlans={ this.props.sitePlans }
					context={ this.props.context } />
				{
					selectedSite &&
					<QuerySitePlans siteId={ selectedSite.ID } />
				}
			</div>
		);
	}
} );

export default connect(
	function( state, props ) {
		return {
			sitePlans: getPlansBySite( state, props.sites.getSelectedSite() )
		};
	}
)( DomainManagementData );
