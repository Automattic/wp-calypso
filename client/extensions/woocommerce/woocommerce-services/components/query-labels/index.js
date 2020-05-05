/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import QueryLabelSettings from 'woocommerce/woocommerce-services/components/query-label-settings';
import QueryPackages from 'woocommerce/woocommerce-services/components/query-packages';
import QueryLocations from 'woocommerce/components/query-locations';
import {
	fetchLabelsData,
	fetchLabelsStatus,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	hasRefreshedLabelStatus,
	isError,
	isFetching,
	isLoaded,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

class QueryLabels extends Component {
	fetch( props ) {
		const { orderId, siteId, loaded, fetching, error, refreshedLabelStatus } = props;
		if ( ! loaded && ! fetching && ! error ) {
			this.props.fetchLabelsData( orderId, siteId );
		} else if ( loaded && ! refreshedLabelStatus ) {
			this.props.fetchLabelsStatus( orderId, siteId );
		}
	}

	UNSAFE_componentWillMount() {
		this.fetch( this.props );
	}

	UNSAFE_componentWillReceiveProps( newProps ) {
		this.fetch( newProps );
	}

	render() {
		const { siteId } = this.props;

		return (
			<div>
				<QueryLabelSettings siteId={ siteId } />
				<QueryPackages siteId={ siteId } />
				<QueryLocations siteId={ siteId } />
			</div>
		);
	}
}

QueryLabels.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
};

export default connect(
	( state, { orderId } ) => ( {
		loaded: isLoaded( state, orderId ),
		fetching: isFetching( state, orderId ),
		error: isError( state, orderId ),
		refreshedLabelStatus: hasRefreshedLabelStatus( state, orderId ),
	} ),
	( dispatch ) =>
		bindActionCreators(
			{
				fetchLabelsData,
				fetchLabelsStatus,
			},
			dispatch
		)
)( QueryLabels );
