import { speak } from '@wordpress/a11y';
import { useEffect, useState } from 'react';

const AuthorizationScreenReaderIndicator = ( { message } ) => {
	const [ prevMessage, setPrevMessage ] = useState( message );

	useEffect( () => {
		if ( prevMessage !== message && message ) {
			speak( message, 'polite' );
			setPrevMessage( message );
		}
	}, [ message, prevMessage, setPrevMessage ] );

	return null;
};

export default AuthorizationScreenReaderIndicator;
