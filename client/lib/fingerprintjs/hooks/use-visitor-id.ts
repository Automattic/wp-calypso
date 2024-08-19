import FingerprintJS from '@automattic/fingerprintjs';
import { useEffect, useState } from 'react';

export default function useVisitorId() {
	const [ visitorId, setVisitorId ] = useState( '' );
	useEffect( () => {
		FingerprintJS.load().then( ( fp ) =>
			fp.get().then( ( result ) => setVisitorId( result.visitorId ) )
		);
	}, [] );
	return visitorId;
}
