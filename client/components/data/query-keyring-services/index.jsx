import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestKeyringServices } from 'calypso/state/sharing/services/actions';
import { isKeyringServicesFetching } from 'calypso/state/sharing/services/selectors';

const request = () => ( dispatch, getState ) => {
	if ( ! isKeyringServicesFetching( getState() ) ) {
		dispatch( requestKeyringServices() );
	}
};

export default function QueryKeyringServices() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request() );
	}, [ dispatch ] );

	return null;
}
