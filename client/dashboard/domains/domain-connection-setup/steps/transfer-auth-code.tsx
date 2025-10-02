import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
	Button,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { TransferStepComponentProps } from '../types';

export function TransferAuthCode( { domainName }: TransferStepComponentProps ) {
	// const recordTransferButtonClickInUseYourDomain = useCallback(
	// 	() => recordTracksEvent( 'calypso_use_your_domain_transfer_click', { domain } ),
	// 	[ domain ]
	// );

	return (
		<VStack spacing={ 6 }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<Heading level="3">
							{ sprintf(
								/* translators: %s: the domain name that is being transferred (ex.: example.com) */
								__( 'Enter the authorization code for %s.' ),
								domainName
							) }
						</Heading>
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
