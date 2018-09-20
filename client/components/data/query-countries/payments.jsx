/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import areCountriesFetching from 'state/selectors/are-countries-fetching';
import QueryCountries from 'components/data/query-countries';
import { fetchPaymentCountries } from 'state/countries/actions';

export default connect(
	state => ( {
		isRequesting: areCountriesFetching( state, 'payments' ),
	} ),
	{
		requestCountries: fetchPaymentCountries,
	}
)( QueryCountries );
