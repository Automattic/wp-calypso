import {
	TextControl,
	TextareaControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { Text } from '../../../components/text';
import ReferralLogoField from './logo-field';
import type { ReferralLogo } from './lib/logo';

interface Props {
	email: string;
	emailError: string | null;
	message: string;
	logo: ReferralLogo;
	profileLogoUrl: string | null;
	lastReferralLogoUrl: string | null;
	onEmailChange: ( email: string ) => void;
	onMessageChange: ( message: string ) => void;
	onLogoChange: ( logo: ReferralLogo ) => void;
}

export default function RequestClientPaymentForm( {
	email,
	emailError,
	message,
	logo,
	profileLogoUrl,
	lastReferralLogoUrl,
	onEmailChange,
	onMessageChange,
	onLogoChange,
}: Props ) {
	const { recordTracksEvent } = useAnalytics();

	return (
		<VStack spacing={ 6 }>
			<VStack spacing={ 1 }>
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					type="email"
					label={ __( 'Client’s email address' ) }
					value={ email }
					onChange={ onEmailChange }
					onClick={ () => recordTracksEvent( 'calypso_a4a_client_referral_form_email_click' ) }
					help={
						emailError
							? undefined
							: __( 'They get an email with a link to pay. Nothing is charged to you.' )
					}
				/>
				{ emailError && (
					<Text intent="error" role="alert">
						{ emailError }
					</Text>
				) }
			</VStack>
			<TextareaControl
				__nextHasNoMarginBottom
				label={ __( 'Custom message' ) }
				value={ message }
				onChange={ onMessageChange }
				onClick={ () => recordTracksEvent( 'calypso_a4a_client_referral_form_message_click' ) }
				placeholder={ __( 'Optional. A line your client will see above the order.' ) }
				rows={ 4 }
			/>
			<ReferralLogoField
				value={ logo }
				onChange={ onLogoChange }
				profileLogoUrl={ profileLogoUrl }
				lastReferralLogoUrl={ lastReferralLogoUrl }
			/>
		</VStack>
	);
}
