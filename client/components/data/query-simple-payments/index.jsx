/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestProduct, requestProducts } from 'state/simple-payments/product-list/actions';

class QuerySimplePayments extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if (
			nextProps.siteId !== this.props.siteId ||
			nextProps.productId !== this.props.productId
		) {
			this.request( nextProps );
		}
	}

	request( props ) {
		const { siteId } = props;

		if ( ! props.siteId ) {
			return;
		}

		if ( props.allProducts ) {
			props.requestProducts( siteId );
		}

		if ( props.productId ) {
			props.requestProduct( siteId, props.productId );
		}
	}

	render() {
		return null;
	}
}

QuerySimplePayments.propTypes = {
	allProducts: PropTypes.bool,
	siteId: PropTypes.number.isRequired,
	requestProduct: PropTypes.func,
	requestProducts: PropTypes.func,
};

QuerySimplePayments.defaultProps = {
	allProducts: false,
	requestProduct: () => {},
	requestProducts: () => {},
};

export default connect( null, { requestProduct, requestProducts } )( QuerySimplePayments );
