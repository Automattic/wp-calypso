/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

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
	const fetchingPreferences = useRef( useSelector( isFetchingPreferences ) );
	const dispatch = useDispatch();

	useEffect( () => {
		if ( ! fetchingPreferences.current ) {
			dispatch( request() );
		}
	}, [ dispatch ] );

	return null;
}
