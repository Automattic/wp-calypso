import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useResendEmailVerification } from 'calypso/landing/stepper/hooks/use-resend-email-verification';

interface EmailValidationBannerProps {
	email: string;
	closeBanner: () => void;
}

const EmailValidationBanner = ( { email, closeBanner }: EmailValidationBannerProps ) => {
	const resendEmailVerification = useResendEmailVerification();
	const translate = useTranslate();

	return (
		<div className="launchpad__email-validation-banner">
			<div className="launchpad__email-validation-banner-content">
				<Gridicon
					className="launchpad__email-validation-banner-content-checkmark-icon"
					icon="checkmark-circle"
					size={ 18 }
				/>
				<p>
					{ translate(
						'Make sure to validate the email we sent to %(email)s in order to publish and share your posts. {{resendEmailLink}}Resend email{{/resendEmailLink}} or {{changeEmailLink}}change email address{{/changeEmailLink}}',
						{
							args: { email },
							components: {
								resendEmailLink: (
									<button
										className="launchpad__email-validation-banner-content-resend-button"
										onClick={ resendEmailVerification }
									/>
								),
								changeEmailLink: <a href="/me/account" />,
							},
						}
					) }
				</p>
			</div>
			<button
				className="launchpad__email-validation-banner-close-button"
				aria-label="close"
				onClick={ closeBanner }
			>
				<Gridicon
					className="launchpad__email-validation-banner-close-button-close-icon"
					icon="cross"
					size={ 16 }
				/>
			</button>
		</div>
	);
};

export default EmailValidationBanner;
