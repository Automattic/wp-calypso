/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StoreConnection from 'client/components/data/store-connection';
import DomainsStore from 'client/lib/domains/store';
import CartStore from 'client/lib/cart/store';
import observe from 'client/lib/mixins/data-observe';
import * as upgradesActions from 'client/lib/upgrades/actions';
import QuerySitePlans from 'client/components/data/query-site-plans';
import QueryContactDetailsCache from 'client/components/data/query-contact-details-cache';
import { getPlansBySite } from 'client/state/sites/plans/selectors';
import { getSelectedSite } from 'client/state/ui/selectors';

const stores = [ DomainsStore, CartStore ];

function getStateFromStores( props ) {
	return {
		cart: CartStore.get(),
		context: props.context,
		domains: props.selectedSite ? DomainsStore.getBySite( props.selectedSite.ID ) : null,
		products: props.products,
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite,
		sitePlans: props.sitePlans,
	};
}

const DomainManagementData = createReactClass( {
	displayName: 'DomainManagementData',

	propTypes: {
		context: PropTypes.object.isRequired,
		productsList: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string,
		selectedSite: PropTypes.object,
		sitePlans: PropTypes.object.isRequired,
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
				{ this.props.selectedSite && <QuerySitePlans siteId={ this.props.selectedSite.ID } /> && (
						<QueryContactDetailsCache />
					) }
			</div>
		);
	},
} );

const mapStateToProps = state => {
	const selectedSite = getSelectedSite( state );

	return {
		sitePlans: getPlansBySite( state, selectedSite ),
		selectedSite,
	};
};

export default connect( mapStateToProps )( DomainManagementData );
