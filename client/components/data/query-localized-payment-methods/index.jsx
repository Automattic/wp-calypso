/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingLocalizedPaymentMethods } from 'state/selectors/is-requesting-localized-payment-methods';
import { getCurrentUserLocale } from 'state/current-user/selectors';
import { getGeoCountryShort } from 'state/geo/selectors';
import { requestLocalizedPaymentMethods } from 'state/i18n/actions';

class QueryLocalizedPaymentMethods extends Component {
	componentWillMount() {
		if ( this.props.requesting ) {
			return;
		}

		const lang = this.props.lang || this.props.userLocale,
			cc = this.props.countryCode || this.props.userCountryCode;

		this.props.requestLocalizedPaymentMethods( lang, cc );
	}

	render() {
		return null;
	}
}

QueryLocalizedPaymentMethods.propTypes = {
	lang: PropTypes.string,
	countryCode: PropTypes.string,
	userCountryCode: PropTypes.string,
	userLocale: PropTypes.string,
	requesting: PropTypes.bool,
	requestLocalizedPaymentMethods: PropTypes.func
};

export default connect(
	( state ) => {
		return {
			requesting: isRequestingLocalizedPaymentMethods( state ),
			userCountryCode: getGeoCountryShort( state ),
			userLocale: getCurrentUserLocale( state ),
		};
	},
	{ requestLocalizedPaymentMethods }
)( QueryLocalizedPaymentMethods );
