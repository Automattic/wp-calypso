import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useOdieAssistantContext } from '../../context';

const MESSAGE_SIZE_ERROR_NOTICE_ID = 'message-size-error-notice';

export default function useMessageSizeErrorNotice() {
	const { setNotice } = useOdieAssistantContext();

	const isMessageLengthValid = useMemo( () => {
		return ( message?: string ) => {
			if ( message?.length && message.length > 3 ) {
				return false;
			}
			return true;
		};
	}, [] );

	const setMessageLengthErrorNotice = () => {
		setNotice(
			MESSAGE_SIZE_ERROR_NOTICE_ID,
			__( 'Message exceeds 4096 characters limit.', __i18n_text_domain__ )
		);
	};

	const clearMessageLengthErrorNotice = () => {
		setNotice( MESSAGE_SIZE_ERROR_NOTICE_ID, null );
	};

	return { isMessageLengthValid, setMessageLengthErrorNotice, clearMessageLengthErrorNotice };
}
