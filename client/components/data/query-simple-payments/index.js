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
	static propTypes = {
		productId: PropTypes.number,
		siteId: PropTypes.number.isRequired,
		requestProduct: PropTypes.func,
		requestProducts: PropTypes.func,
	};

	static defaultProps = {
		productId: null,
	};

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
		const { siteId, productId } = props;

		if ( ! siteId ) {
			return;
		}

		if ( productId ) {
			props.requestProduct( siteId, productId );

			return;
		}

		props.requestProducts( siteId );
	}

	render() {
		return null;
	}
}

export default connect( null, { requestProduct, requestProducts } )( QuerySimplePayments );
