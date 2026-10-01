import {
	TextControl,
	TextareaControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { Text } from '../../../components/text';

interface Props {
	email: string;
	emailError: string | null;
	message: string;
	onEmailChange: ( email: string ) => void;
	onMessageChange: ( message: string ) => void;
}

export default function RequestClientPaymentForm( {
	email,
	emailError,
	message,
	onEmailChange,
	onMessageChange,
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
		</VStack>
	);
}
