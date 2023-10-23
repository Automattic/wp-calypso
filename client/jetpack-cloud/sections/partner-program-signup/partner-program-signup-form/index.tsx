import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import './style.scss';

export default function PartnerProgramSignupForm() {
	const translate = useTranslate();
	return (
		<Card className="partner-program-signup-form">
			<svg
				className="partner-program-signup-form__logo"
				width="32"
				height="32"
				viewBox="0 0 32 32"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16C0 7.16345 7.16344 0 16 0C24.8366 0 32 7.16345 32 16ZM15.1756 18.6566V3.17569L7.20612 18.6566H15.1756ZM16.794 13.3124V28.8239L24.794 13.3124H16.794Z"
					fill="#069E08"
				/>
			</svg>

			<CardHeading className="partner-program-signup-form__heading">
				{ translate( 'Sign up for the Jetpack Agency & Pro Partner program' ) }
			</CardHeading>

			<h2 className="partner-program-signup-form__subheading">
				{ translate( 'Tell us about yourself and your business.' ) }
			</h2>
		</Card>
	);
}
