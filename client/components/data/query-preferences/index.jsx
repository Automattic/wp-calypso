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

export default function QueryPreferences() {
	const fetchingPreferences = useRef( useSelector( isFetchingPreferences ) );
	const dispatch = useDispatch();

	// Only runs on mount.
	useEffect( () => {
		if ( ! fetchingPreferences.current ) {
			fetchPreferences()( dispatch );
		}
	}, [ dispatch ] );

	return null;
}
