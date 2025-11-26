import { useState, useCallback } from 'react';

/**
 * Manages temporary status flags (sending, transferring).
 * These are local UI states, not derived from API data.
 */
export const useChatStatusFlags = () => {
	const [ isSending, setIsSending ] = useState( false );
	const [ isTransferring, setIsTransferring ] = useState( false );

	const setSending = useCallback( ( sending: boolean ) => {
		setIsSending( sending );
	}, [] );

	const setTransferring = useCallback( ( transferring: boolean ) => {
		setIsTransferring( transferring );
	}, [] );

	return {
		isSending,
		isTransferring,
		setSending,
		setTransferring,
	};
};
