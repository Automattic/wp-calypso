const isAudioSupported = () => typeof window === 'object' && typeof window.Audio === 'function';

export const playSound = src => {
	if ( ! isAudioSupported() ) {
		return;
	}

	const audioClip = new window.Audio( src );
	audioClip.play();
};

export const playSoundForMessageToCustomer = ( dispatch, { event } ) => {
	// If the customer sent the message, there's no
	// need to play a sound to the customer.
	if ( event && event.source === 'customer' ) {
		return;
	}

	playSound( '/calypso/audio/chat-pling.wav' );
};

const receiveEvent = ( { dispatch }, action ) => {
	if ( ! isAudioSupported() ) {
		return;
	}

	playSoundForMessageToCustomer( dispatch, action );
};

export default receiveEvent;
