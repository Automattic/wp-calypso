import { restoreDatabasePassword } from '@automattic/api-core';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Modal,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';

interface ResetPasswordModalProps {
	siteId: number;
	onClose: () => void;
	onSuccess: () => void;
	onError: () => void;
}

export default function ResetPasswordModal( {
	siteId,
	onClose,
	onSuccess,
	onError,
}: ResetPasswordModalProps ) {
	const [ isRestoring, setIsRestoring ] = useState( false );

	const handleRestore = () => {
		setIsRestoring( true );
		restoreDatabasePassword( siteId )
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
				<ButtonStack justify="flex-end">
					<Button onClick={ onClose }>{ __( 'Cancel' ) }</Button>
					<Button variant="primary" isBusy={ isRestoring } onClick={ handleRestore }>
						{ __( 'Restore' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}
