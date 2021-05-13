/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryCountries from 'calypso/components/data/query-countries';
import { fetchDomainCountries } from 'calypso/state/countries/actions';

export default connect( null, { requestCountries: fetchDomainCountries } )( QueryCountries );
