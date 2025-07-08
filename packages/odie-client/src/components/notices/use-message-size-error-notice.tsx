import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { useOdieAssistantContext } from '../../context';

const MESSAGE_SIZE_ERROR_NOTICE_ID = 'message-size-error-notice';

export default function useMessageSizeErrorNotice() {
	const { setNotice } = useOdieAssistantContext();

	const isMessageLengthValid = useCallback(
		( message?: string ) => {
			if ( message?.length && message.length > 4096 ) {
				setNotice(
					MESSAGE_SIZE_ERROR_NOTICE_ID,
					__( 'Message exceeds 4096 characters limit.', __i18n_text_domain__ )
				);
				return false;
			}
			setNotice( MESSAGE_SIZE_ERROR_NOTICE_ID, null );
			return true;
		},
		[ setNotice ]
	);

	return isMessageLengthValid;
}
