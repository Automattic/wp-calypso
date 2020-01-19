/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryCountries from 'components/data/query-countries';
import { fetchDomainCountries } from 'state/countries/actions';

export default connect( null, { requestCountries: fetchDomainCountries } )( QueryCountries );
