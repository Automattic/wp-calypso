import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { setRoute } from 'calypso/state/route/actions';
import 'calypso/state/route/init';

const useSyncRoute = () => {
	const { pathname, search } = window.location;
	const dispatch = useDispatch();

	useEffect( () => {
		const searchParams = new URLSearchParams( search );
		const query = Object.fromEntries( searchParams.entries() );
		dispatch( setRoute( pathname, query ) );
	}, [ pathname, search ] );
};

export default useSyncRoute;
