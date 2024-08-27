import { getVisitorId } from '@automattic/fingerprintjs';
import { useEffect, useState } from 'react';

export function useVisitorId() {
	const [ visitorId, setVisitorId ] = useState( '' );
	useEffect( () => {
		getVisitorId().then( ( id ) => setVisitorId( id ) );
	}, [] );
	return visitorId;
}
