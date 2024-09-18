import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Banner from 'calypso/components/banner';
import EmailVerificationDialog from 'calypso/components/email-verification/email-verification-dialog';
import { useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import isPendingEmailChange from 'calypso/state/selectors/is-pending-email-change';

const EmailVerificationBanner: React.FC = () => {
	const isVerified = useSelector( isCurrentUserEmailVerified );
	const isEmailChangePending = useSelector( isPendingEmailChange );
	const translate = useTranslate();
	const [ isDialogOpen, setIsDialogOpen ] = useState( false );

	if ( isVerified && ! isEmailChangePending ) {
		return null;
	}

	return (
		<>
			{ isDialogOpen && <EmailVerificationDialog onClose={ () => setIsDialogOpen( false ) } /> }
			<Banner
				title={ translate( 'Please, verify your email address.' ) }
				description={ translate(
					'Verifying your email helps you secure your WordPress.com account and enables key features.'
				) }
				callToAction={ translate( 'Verify email' ) }
				onClick={ () => {
					setIsDialogOpen( true );
				} }
			/>
		</>
	);
};

export default EmailVerificationBanner;
