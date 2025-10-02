import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
	Button,
	__experimentalText as Text,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export function TransferAuthCode() {
	// const recordTransferButtonClickInUseYourDomain = useCallback(
	// 	() => recordTracksEvent( 'calypso_use_your_domain_transfer_click', { domain } ),
	// 	[ domain ]
	// );

	return (
		<VStack spacing={ 6 }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<Text as="p">
							{ __(
								'A domain authorization code is a unique code linked only to your domain, it might also be called a secret code, auth code, or EPP code. You can usually find this in your domain settings page.'
							) }
						</Text>

						<InputControl
							label={ __( 'Authorization code' ) }
							placeholder={ __( 'Enter authorization code' ) }
						/>

						<Text as="p">
							{ __(
								'Once you’ve entered the authorization code, click on the button below to proceed.'
							) }
						</Text>

						<HStack justify="flex-start">
							<Button variant="primary">{ __( 'Check readiness for transfer' ) }</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
