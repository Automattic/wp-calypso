import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
	Button,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { lock } from '@wordpress/icons';
import { TransferStepComponentProps } from '../types';

export function TransferUnlock( { onNextStep }: TransferStepComponentProps ) {
	return (
		<VStack spacing={ 6 }>
			{ /*domainStatusError && ! checkInProgress && (
				<Notice variant="error">{ getErrorMessage() }</Notice>
			) */ }
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<HStack justify="flex-start" alignment="center">
							<Icon icon={ lock } />
							<Heading level="3">{ __( 'Your domain is locked' ) }</Heading>
						</HStack>
						<Text as="p">
							{ __(
								'Domain providers lock domains to prevent unauthorized transfers. You’ll need to unlock it on your domain provider’s settings page. Some domain providers require you to contact them via their customer support to unlock it.'
							) }
						</Text>
						<Text as="p">
							{ __(
								'It might take a few minutes for any changes to take effect. Once you have unlocked your domain click on the button below to proceed.'
							) }
						</Text>

						<HStack justify="flex-start">
							<Button variant="primary" onClick={ onNextStep }>
								{ __( 'I’ve unlocked my domain' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
