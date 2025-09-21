import {
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface UsernameUpdateConfirmationModalProps {
	isVisible: boolean;
	currentUsername: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export default function UsernameUpdateConfirmationModal( {
	isVisible,
	currentUsername,
	onConfirm,
	onCancel,
}: UsernameUpdateConfirmationModalProps ) {
	if ( ! isVisible ) {
		return null;
	}

	return (
		<ConfirmDialog onConfirm={ onConfirm } onCancel={ onCancel }>
			<VStack spacing={ 4 }>
				<h3>{ __( 'Confirm username change' ) }</h3>
				<p>
					{
						/* translators: %(username)s is the current username that will be changed */
						__(
							'You are about to change your username, {{strong}}%(username)s{{/strong}}. ' +
								'Once changed, you will not be able to revert it.'
						)
							.replace( '{{strong}}', '' )
							.replace( '{{/strong}}', '' )
							.replace( '%(username)s', currentUsername )
					}{ ' ' }
					{ __(
						'Changing your username will also affect your Gravatar profile and IntenseDebate profile addresses.'
					) }
				</p>
			</VStack>
		</ConfirmDialog>
	);
}
