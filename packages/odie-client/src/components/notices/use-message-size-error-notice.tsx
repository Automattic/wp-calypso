import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { useOdieAssistantContext } from '../../context';

export default function useMessageSizeErrorNotice() {
	const { setNotice } = useOdieAssistantContext();

	const isMessageLengthValid = useCallback(
		( message?: string ) => {
			if ( message?.length && message.length > 4096 ) {
				setNotice(
					'message-size-error',
					__( 'Message exceeds 4096 characters limit.', __i18n_text_domain__ )
				);
				return false;
			}
			setNotice( 'message-size-error', null );
			return true;
		},
		[ setNotice ]
	);

	return isMessageLengthValid;
}
