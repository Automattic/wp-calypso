/** @format */

/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestProducts } from 'state/memberships/product-list/actions';

class QueryMemberships extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestProducts: PropTypes.func,
	};

	static defaultProps = {
		productId: null,
	};

	componentDidMount() {
		if ( this.props.requesting ) {
			return;
		}

		if ( ! this.props.siteId ) {
			return;
		}

		this.props.requestProducts( this.props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	null,
	{ requestProducts }
)( QueryMemberships );
