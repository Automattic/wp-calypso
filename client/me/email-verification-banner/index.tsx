import { Substitution, useTranslate } from 'i18n-calypso';
import React, { useCallback, useState } from 'react';
import Banner from 'calypso/components/banner';
import EmailVerificationDialog from 'calypso/components/email-verification/email-verification-dialog';
import useGetEmailToVerify from 'calypso/components/email-verification/hooks/use-get-email-to-verify';
import { emailFormEventEmitter } from 'calypso/me/account/account-email-field';
import { useDispatch, useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import isPendingEmailChange from 'calypso/state/selectors/is-pending-email-change';
import { setUserSetting } from 'calypso/state/user-settings/actions';
import { saveUnsavedUserSettings } from 'calypso/state/user-settings/thunks';
import './style.scss';

const EmailVerificationBanner: React.FC< {
	customDescription?: string | React.ReactNode;
	dialogCloseLabel?: string | React.ReactNode;
	dialogCloseAction?: () => void;
} > = ( { customDescription, dialogCloseLabel, dialogCloseAction = () => {} } ) => {
	const isVerified = useSelector( isCurrentUserEmailVerified );
	const isEmailChangePending = useSelector( isPendingEmailChange );
	const translate = useTranslate();
	const [ isDialogOpen, setIsDialogOpen ] = useState( false );

	if ( isVerified && ! isEmailChangePending ) {
		return null;
	}

	return (
		<>
			{ isDialogOpen && (
				<EmailVerificationDialog
					onClose={ () => setIsDialogOpen( false ) }
					closeLabel={ dialogCloseLabel }
					// We only want this triggered from the close button, but not from clicking
					// outside to close the modal (so not adding to onClose prop).
					closeButtonAction={ dialogCloseAction }
				/>
			) }
			<Banner
				className="email-verification-banner"
				title={ translate( 'Verify your email address.' ) }
				description={
					customDescription
						? customDescription
						: translate(
								'Verifying your email helps you secure your WordPress.com account and enables key features, like changing your username.'
						  )
				}
				callToAction={ translate( 'Verify email' ) }
				onClick={ () => {
					setIsDialogOpen( true );
				} }
				icon="notice"
				disableHref
			/>
		</>
	);
};

interface Props {
	setIsBusy: ( isBusy: boolean ) => void;
}

const EmailVerificationBannerV2: React.FC< Props > = ( { setIsBusy } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const emailToVerify = useGetEmailToVerify();
	const [ isSendingEmail, setIsSendingEmail ] = useState( false );

	const highlightEmailInput = useCallback( () => {
		emailFormEventEmitter?.dispatchEvent( new Event( 'highlightInput' ) );
	}, [] );

	const resendEmailToVerify = useCallback( async () => {
		setIsBusy( true );
		setIsSendingEmail( true );
		try {
			dispatch( setUserSetting( 'user_email', emailToVerify ) );
			await dispatch( saveUnsavedUserSettings( [ 'user_email' ] ) );
			dispatch(
				successNotice(
					translate(
						'We sent an email to %(email)s. Please check your inbox to verify your email.',
						{
							args: { email: emailToVerify as Substitution },
						}
					)
				)
			);
		} catch ( err ) {
			dispatch(
				errorNotice(
					err instanceof Error
						? err.message
						: translate( 'There was an error while resending the email. Please try again.' )
				)
			);
		} finally {
			setIsBusy( false );
			setIsSendingEmail( false );
		}
	}, [ dispatch, emailToVerify, setIsBusy, translate ] );

	if ( ! emailToVerify ) {
		return null;
	}

	const description = translate(
		'Check your inbox at {{strong}}%(email)s{{/strong}} for the confirmation email, or click "Resend email" to get a new one.',
		{
			args: { email: emailToVerify as Substitution },
			components: {
				strong: <strong className="email-verification-banner__highlight" />,
			},
		}
	);

	return (
		<Banner
			className="email-verification-banner"
			icon="notice"
			title={ translate( 'Verify your email' ) }
			description={ description }
			callToAction={ translate( 'Resend email' ) }
			onClick={ resendEmailToVerify }
			secondaryCallToAction={ translate( 'Update email' ) }
			secondaryOnClick={ highlightEmailInput }
			disableHref
			isBusy={ isSendingEmail }
		/>
	);
};

export { EmailVerificationBannerV2 };
export default EmailVerificationBanner;
