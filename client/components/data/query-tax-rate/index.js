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
import config from 'config';
import getPaymentCountryCode from 'state/selectors/get-payment-country-code';
import { getCurrentUserCountryCode } from 'state/current-user/selectors';
import getTaxRate from 'state/selectors/get-tax-rate';

const requestTaxRate = () => ( config.isEnabled( 'tax11' ) ? 0.11 : null );

export class QueryTaxRate extends Component {
	static propTypes = {
		requestTaxRate: PropTypes.func.isRequired,
		countryCode: PropTypes.string,
		postCode: PropTypes.string,
		taxRate: PropTypes.number,
	};

	componentDidMount() {
		if ( this.props.taxRate ) {
			return;
		}

		this.props.requestTaxRate( this.props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	state => ( {
		countryCode: getPaymentCountryCode( state ) || getCurrentUserCountryCode( state ),
		postCode: 12345, // TODO FIXME
		taxRate: getTaxRate( state ),
	} ),
	{ requestTaxRate }
)( QueryTaxRate );
