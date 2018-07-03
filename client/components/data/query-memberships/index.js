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
		productId: PropTypes.number,
		siteId: PropTypes.number.isRequired,
		requestProduct: PropTypes.func,
		requestProducts: PropTypes.func,
	};

	static defaultProps = {
		productId: null,
	};

	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId || nextProps.productId !== this.props.productId ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		const { siteId, productId } = props;

		if ( ! siteId ) {
			return;
		}

		// Products are indexed from 1.
		if ( productId === 0 ) {
			return;
		}

		props.requestProducts( siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	null,
	{ requestProducts }
)( QueryMemberships );
