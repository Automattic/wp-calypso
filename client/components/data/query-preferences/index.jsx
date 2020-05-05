/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFetchingPreferences } from 'state/preferences/selectors';
import { fetchPreferences } from 'state/preferences/actions';

const request = () => ( dispatch, getState ) => {
	if ( ! isFetchingPreferences( getState() ) ) {
		dispatch( fetchPreferences() );
	}
};

export default function QueryPreferences() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request() );
	}, [ dispatch ] );

	return null;
}
