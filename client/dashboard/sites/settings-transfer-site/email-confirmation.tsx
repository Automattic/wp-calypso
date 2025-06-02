import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, inbox } from '@wordpress/icons';

export function EmailConfirmation( { userEmail }: { userEmail: string } ) {
	return (
		<VStack style={ { padding: '8px 0 12px' } }>
			<HStack justify="flex-start">
				<Icon icon={ inbox } />
				<Text size="15px" weight={ 500 } lineHeight="32px" as="h2">
					{ __( 'Check your inbox' ) }
				</Text>
			</HStack>
			<Text>
				{ createInterpolateElement(
					__(
						'We’ve sent a transfer confirmation email to <userEmail />. Please check your inbox and spam folder. The transfer will not proceed unless you authorize it using the link in the email.'
					),
					{
						userEmail: <strong>{ userEmail }</strong>,
					}
				) }
			</Text>
		</VStack>
	);
}
