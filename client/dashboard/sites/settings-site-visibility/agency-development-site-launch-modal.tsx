import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Modal,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { launchSiteMutation } from '../../app/queries';
import type { Site } from '../../data/types';

interface AgencyDevelopmentSiteLaunchModalProps {
	site: Site;
	onClose: () => void;
}

export default function AgencyDevelopmentSiteLaunchModal( {
	site,
	onClose,
}: AgencyDevelopmentSiteLaunchModalProps ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ isLaunching, setIsLaunching ] = useState( false );
	const mutation = useMutation( launchSiteMutation( site.slug ) );

	const handleLaunch = () => {
		setIsLaunching( true );
		mutation.mutate( undefined, {
			onSuccess: () => {
				createSuccessNotice(
					__( 'Your site has been launched; now you can share it with the world!' ),
					{
						type: 'snackbar',
					}
				);
			},
			onError: ( error: Error ) => {
				createErrorNotice( error.message || __( 'Failed to launch site' ), {
					type: 'snackbar',
				} );
			},
			onSettled: () => {
				setIsLaunching( false );
				onClose();
			},
		} );
	};

	return (
		<Modal title={ __( "You're about to launch this website" ) } onRequestClose={ onClose }>
			<VStack spacing={ 6 }>
				<Text as="p">
					{ __( "After launch, we'll bill your agency in the next billing cycle." ) }
				</Text>
				<HStack justify="flex-end" spacing={ 2 }>
					<Button disabled={ isLaunching } onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button variant="primary" isBusy={ isLaunching } onClick={ handleLaunch }>
						{ __( 'Launch site' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
