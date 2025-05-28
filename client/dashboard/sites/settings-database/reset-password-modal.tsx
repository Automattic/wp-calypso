import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Modal,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { resetPhpMyAdminPassword } from '../../data';

interface ResetPasswordModalProps {
	siteSlug: string;
	onClose: () => void;
	onSuccess: () => void;
	onError: () => void;
}

export default function ResetPasswordModal( {
	siteSlug,
	onClose,
	onSuccess,
	onError,
}: ResetPasswordModalProps ) {
	const [ isRestoring, setIsRestoring ] = useState( false );

	const handleRestore = () => {
		setIsRestoring( true );
		resetPhpMyAdminPassword( siteSlug )
			.then( () => {
				setIsRestoring( false );
				onSuccess();
			} )
			.catch( () => {
				setIsRestoring( false );
				onError();
			} );
	};

	return (
		<Modal title={ __( 'Restore database password' ) } onRequestClose={ onClose }>
			<VStack spacing={ 6 }>
				<Text>
					{ __( 'Are you sure you want to restore the default password of your database?' ) }
				</Text>
				<HStack justify="flex-end" spacing={ 2 }>
					<Button onClick={ onClose }>{ __( 'Cancel' ) }</Button>
					<Button variant="primary" isBusy={ isRestoring } onClick={ handleRestore }>
						{ __( 'Restore' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
