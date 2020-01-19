/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryCountries from 'components/data/query-countries';
import { fetchPaymentCountries } from 'state/countries/actions';

export default connect( null, { requestCountries: fetchPaymentCountries } )( QueryCountries );
