import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAkismetKey } from 'calypso/state/akismet-key/actions';
import isFetchingAkismetKey from 'calypso/state/akismet-key/selectors/is-fetching-akismet-key';

const QueryAkismetKey = () => {
	const dispatch = useDispatch();

	const isFetchingAkismetAPIKey = useSelector( ( state ) => isFetchingAkismetKey( state ) );

	useEffect( () => {
		if ( isFetchingAkismetAPIKey === null ) {
			dispatch( fetchAkismetKey() );
		}
	}, [ dispatch, isFetchingAkismetAPIKey ] );

	return null;
};

export default QueryAkismetKey;
