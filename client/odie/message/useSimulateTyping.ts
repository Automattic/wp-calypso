import { useEffect, useState, useRef } from 'react';
import type { Message } from '../types';

export const useSimulateTyping = ( message: Message ) => {
	const [ realTimeMessage, setRealTimeMessage ] = useState< string >( '' );
	const currentIndex = useRef( 0 );

	useEffect( () => {
		// Exit early if the the message to process is comming from the user
		if ( message.role === 'user' || message.type !== 'message' ) {
			return;
		}

		if ( message.simulateTyping ) {
			const words = message.content.split( ' ' );

			const typeWord = () => {
				if ( currentIndex.current < words.length ) {
					setRealTimeMessage(
						( prevMessage ) => prevMessage + ' ' + words[ currentIndex.current ]
					);

					currentIndex.current++;

					const delay = Math.random() * ( 66 - 33 ) + 33;
					setTimeout( typeWord, delay );
				}
			};

			setRealTimeMessage( words[ 0 ] );
			currentIndex.current = 1;

			const initialDelay = Math.random() * ( 66 - 33 ) + 33;
			setTimeout( typeWord, initialDelay );
		} else if ( ! message.simulateTyping ) {
			setRealTimeMessage( message.content );
		}
	}, [ message ] );

	return realTimeMessage;
};
