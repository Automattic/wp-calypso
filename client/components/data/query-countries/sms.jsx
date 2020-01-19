/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryCountries from 'components/data/query-countries';
import { fetchSmsCountries } from 'state/countries/actions';

export default connect( null, { requestCountries: fetchSmsCountries } )( QueryCountries );
