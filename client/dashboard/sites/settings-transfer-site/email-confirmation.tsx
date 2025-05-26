import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { Icon, inbox } from '@wordpress/icons';

export function EmailConfirmation( { userEmail }: { userEmail: string } ) {
	return (
		<VStack style={ { padding: '8px 0 12px' } }>
			<HStack justify="flex-start">
				<Icon icon={ inbox } />
				<Text size="15px" weight={ 500 } lineHeight="32px">
					{ __( 'Check your inbox' ) }
				</Text>
			</HStack>
			<Text>
				{ createInterpolateElement(
					sprintf(
						/* translators: %(userEmail)s - the current user's email */
						'We’ve sent a transfer confirmation email to <strong>%(userEmail)s</strong>. Please check your inbox and spam folder. The transfer will not proceed unless you authorize it using the link in the email.',
						{
							userEmail,
						}
					),
					{
						strong: <strong />,
					}
				) }
			</Text>
		</VStack>
	);
}
