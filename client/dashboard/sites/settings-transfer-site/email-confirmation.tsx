import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, inbox } from '@wordpress/icons';
import { SectionHeader } from '../../components/section-header';

export function EmailConfirmation( { userEmail }: { userEmail: string } ) {
	return (
		<VStack style={ { padding: '8px 0 12px' } }>
			<HStack justify="flex-start">
				<SectionHeader
					title={ __( 'Check your inbox' ) }
					decoration={ <Icon icon={ inbox } /> }
					level={ 3 }
				/>
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
