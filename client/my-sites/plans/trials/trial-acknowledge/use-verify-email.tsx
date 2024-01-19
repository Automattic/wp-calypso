import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import { useSendEmailVerification } from 'calypso/landing/stepper/hooks/use-send-email-verification';
import { EVERY_FIVE_SECONDS } from 'calypso/lib/interval';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { successNotice, warningNotice } from 'calypso/state/notices/actions';

export const useVerifyEmail = () => {
	const dispatch = useDispatch();
	const user = useSelector( getCurrentUser );
	const safeUser = user ?? { email_verified: false, email: '' };
	const sendEmail = useSendEmailVerification();
	const { __ } = useI18n();

	const [ data, setData ] = useState( {
		isVerified: safeUser.email_verified,
		isSending: false,
		email: safeUser.email,
		resent: false,
	} );

	const resendEmail = async () => {
		setData( ( prevState ) => ( {
			...prevState,
			isSending: true,
			resent: true,
		} ) );

		sendEmail()
			.then( () => {
				dispatch( successNotice( __( 'Email verification sent!' ) ) );
				setData( ( prevState ) => ( {
					...prevState,
					isSending: false,
				} ) );
			} )
			.catch( ( e ) => {
				dispatch( warningNotice( e.message ) );
				setData( ( prevState ) => ( {
					...prevState,
					isSending: false,
				} ) );
			} );
	};

	useEffect( () => {
		const interval = setInterval( () => {
			if ( ! safeUser.email_verified ) {
				dispatch( fetchCurrentUser() );
			} else {
				setData( ( prevState ) => ( {
					...prevState,
					isVerified: true,
				} ) );
			}
		}, EVERY_FIVE_SECONDS );
		return () => clearInterval( interval );
	}, [ safeUser.email_verified, dispatch ] );

	return {
		isVerified: data.isVerified,
		isSending: data.isSending,
		hasUser: Boolean( user ),
		email: data.email,
		resendEmail,
	};
};
