import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useResendEmailVerification } from 'calypso/landing/stepper/hooks/use-resend-email-verification';

interface EmailValidationBannerProps {
	email: string;
	closeBanner: () => void;
}

const CheckmarkIcon = () => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g clipPath="url(#clip0_1228_17585)">
			<path
				d="M18.3333 9.23355V10.0002C18.3323 11.7972 17.7504 13.5458 16.6744 14.9851C15.5984 16.4244 14.086 17.4773 12.3628 17.9868C10.6395 18.4963 8.79768 18.4351 7.11202 17.8124C5.42636 17.1896 3.98717 16.0386 3.00909 14.5311C2.03101 13.0236 1.56645 11.2403 1.68469 9.44714C1.80293 7.65402 2.49763 5.94715 3.66519 4.58111C4.83275 3.21506 6.41061 2.26303 8.16345 1.867C9.91629 1.47097 11.7502 1.65216 13.3916 2.38355"
				stroke="#00A32A"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M18.3333 3.33398L10 11.6757L7.5 9.17565"
				stroke="#00A32A"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</g>
		<defs>
			<clipPath id="clip0_1228_17585">
				<rect width="20" height="20" fill="white" />
			</clipPath>
		</defs>
	</svg>
);

const EmailValidationBanner = ( { email, closeBanner }: EmailValidationBannerProps ) => {
	const resendEmailVerification = useResendEmailVerification();
	const translate = useTranslate();

	return (
		<div className="launchpad__email-validation-banner">
			<div className="launchpad__email-validation-banner-content">
				<CheckmarkIcon />
				<p>
					{ translate(
						'Make sure to validate the email we sent to %(email)s in order to publish and share your posts. {{resendEmailLink}}Resend email{{/resendEmailLink}} or {{changeEmailLink}}change email address{{/changeEmailLink}}',
						{
							args: { email: email },
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
			<button className="launchpad__email-validation-banner-close-button" onClick={ closeBanner }>
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
