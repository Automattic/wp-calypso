import { useMemo } from '@wordpress/element';
import { getSubkey } from '../helpers';

// Get subscriber's email address based on the subkey cookie
const useSubscriberEmailAddress = () => {
	const subkey = getSubkey();

	return useMemo( () => {
		if ( ! subkey ) {
			return null;
		}

		const decodedSubkeyValue = decodeURIComponent( subkey );

		const firstPeriodIndex = decodedSubkeyValue.indexOf( '.' );
		if ( firstPeriodIndex === -1 ) {
			return null;
		}

		const emailAddress = decodedSubkeyValue.slice( firstPeriodIndex + 1 );
		return emailAddress;
	}, [ subkey ] );
};

export default useSubscriberEmailAddress;
