import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Banner from 'calypso/components/banner';
import EmailVerificationDialog from 'calypso/components/email-verification/email-verification-dialog';
import { useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import isPendingEmailChange from 'calypso/state/selectors/is-pending-email-change';

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

export default EmailVerificationBanner;
