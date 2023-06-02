import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestCountryStates } from 'calypso/state/country-states/actions';
import { isCountryStatesFetching } from 'calypso/state/country-states/selectors';

const request = ( countryCode ) => ( dispatch, getState ) => {
	if ( ! isCountryStatesFetching( getState(), countryCode ) ) {
		dispatch( requestCountryStates( countryCode ) );
	}
};

function QueryCountryStates( { countryCode } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( countryCode ) );
	}, [ dispatch, countryCode ] );

	return null;
}

QueryCountryStates.propTypes = {
	countryCode: PropTypes.string.isRequired,
};

export default QueryCountryStates;
