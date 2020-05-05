/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFetchingSitePurchases } from 'state/purchases/selectors';
import { fetchSitePurchases } from 'state/purchases/actions';

class QuerySitePurchases extends Component {
	requestSitePurchases( props = this.props ) {
		if ( props.siteId && ! props.requesting ) {
			this.props.fetchSitePurchases( props.siteId );
		}
	}

	UNSAFE_componentWillMount() {
		this.requestSitePurchases();
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId ) {
			return;
		}

		this.requestSitePurchases( nextProps );
	}

	render() {
		return null;
	}
}

QuerySitePurchases.propTypes = {
	siteId: PropTypes.number,
	requesting: PropTypes.bool,
	fetchSitePurchases: PropTypes.func.isRequired,
};

export default connect(
	( state ) => {
		return {
			requesting: isFetchingSitePurchases( state ),
		};
	},
	{ fetchSitePurchases }
)( QuerySitePurchases );
