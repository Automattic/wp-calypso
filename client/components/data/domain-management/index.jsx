/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

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
import { getSelectedSite } from 'state/ui/selectors';

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
		context: PropTypes.object.isRequired,
		productsList: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string,
		selectedSite: PropTypes.object,
		sitePlans: PropTypes.object.isRequired
	},

	mixins: [ observe( 'productsList' ) ],

	componentWillMount: function() {
		const { selectedSite } = this.props;

		if ( selectedSite ) {
			upgradesActions.fetchDomains( selectedSite.ID );
		}
	},

	componentWillUpdate: function( nextProps ) {
		const { selectedSite: prevSite } = this.props;
		const { selectedSite: nextSite } = nextProps;

		if ( nextSite !== prevSite ) {
			upgradesActions.fetchDomains( nextSite.ID );
		}
	},

	render: function() {
		return (
			<div>
				<StoreConnection
					component={ this.props.component }
					stores={ stores }
					getStateFromStores={ getStateFromStores }
					products={ this.props.productsList.get() }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ this.props.selectedSite }
					sitePlans={ this.props.sitePlans }
					context={ this.props.context }
				/>
				{ this.props.selectedSite &&
					<QuerySitePlans siteId={ this.props.selectedSite.ID } />
				}
			</div>
		);
	}
} );

const mapStateToProps = state => {
	const selectedSite = getSelectedSite( state );

	return {
		sitePlans: getPlansBySite( state, selectedSite ),
		selectedSite,
	};
};

export default connect( mapStateToProps )( DomainManagementData );
