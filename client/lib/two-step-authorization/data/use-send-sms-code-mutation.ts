import { useMutation } from '@tanstack/react-query';
import debugFactory from 'debug';
import { useRef } from 'react';
import wp from 'calypso/lib/wp';
import { bumpTwoStepAuthMCStat } from './utils';

const debug = debugFactory( 'calypso:two-step-authorization' );

interface SendSMSResponse {
	sent: true;
}

interface SendSMSError extends Error {
	error?: string;
}
export const useSendSMSCodeMutation = () => {
	const smsResendThrottled = useRef( false );
	const mutation = useMutation< SendSMSResponse, SendSMSError >( {
		mutationFn: () => wp.req.post( '/me/two-step/sms/new' ),
		onError( error ) {
			debug( 'Sending SMS code failed: ' + JSON.stringify( error ) );

			if ( error?.error === 'rate_limited' ) {
				debug( 'SMS resend throttled.' );
				bumpTwoStepAuthMCStat( 'sms-code-send-throttled' );
				smsResendThrottled.current = true;
			}
		},
		onSuccess() {
			smsResendThrottled.current = false;
			bumpTwoStepAuthMCStat( 'sms-code-send-success' );
		},
	} );

	return { ...mutation, smsResendThrottled: smsResendThrottled.current };
};
