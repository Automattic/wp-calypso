import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useMemo } from 'react';

interface UseRotatingLoadingMessagesOptions {
	isBusy: boolean;
	rotationInterval?: number;
}

export const useRotatingLoadingMessages = ( {
	isBusy,
	rotationInterval = 3000,
}: UseRotatingLoadingMessagesOptions ) => {
	const translate = useTranslate();
	const [ currentMessageIndex, setCurrentMessageIndex ] = useState( 0 );

	const loadingMessages = useMemo(
		() => [
			translate( 'Provisioning site' ),
			translate( 'Verifying server details' ),
			translate( 'Checking document root' ),
			translate( 'Validating credentials' ),
			translate( 'Setting up SSH Key' ),
		],
		[ translate ]
	);

	useEffect( () => {
		if ( ! isBusy ) {
			setCurrentMessageIndex( 0 );
			return;
		}

		const interval = setInterval( () => {
			setCurrentMessageIndex( ( prevIndex ) => ( prevIndex + 1 ) % loadingMessages.length );
		}, rotationInterval );

		return () => clearInterval( interval );
	}, [ isBusy, loadingMessages.length, rotationInterval ] );

	const currentMessage = loadingMessages[ currentMessageIndex ];

	return {
		buttonText: isBusy ? currentMessage : translate( 'Continue' ),
	};
};
