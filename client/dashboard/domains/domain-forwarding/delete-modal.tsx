import { domainForwardingDeleteMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import type { DomainForwarding } from '@automattic/api-core';

interface DomainForwardingDeleteModalProps {
	domainName: string;
	domainForwarding: DomainForwarding;
	onClose?: () => void;
}

const DomainForwardingDeleteModal = ( {
	domainName,
	domainForwarding,
	onClose,
}: DomainForwardingDeleteModalProps ) => {
	const deleteMutation = useMutation( {
		...domainForwardingDeleteMutation( domainName ),
		meta: {
			snackbar: {
				success: __( 'Domain forwarding rule deleted.' ),
			},
		},
	} );
	const { createErrorNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();

	const onConfirm = () => {
		deleteMutation.mutate( domainForwarding.domain_redirect_id, {
			onSuccess: () => {
				recordTracksEvent( 'calypso_dashboard_domain_forwarding_delete_record', {
					domain: domainName,
					fqdn: domainForwarding.fqdn,
					target_host: domainForwarding.target_host,
				} );

				onClose?.();
			},
			onError: ( error: Error ) => {
				recordTracksEvent( 'calypso_dashboard_domain_forwarding_delete_record_failure', {
					domain: domainName,
					fqdn: domainForwarding.fqdn,
					target_host: domainForwarding.target_host,
					error_message: error.message,
				} );

				createErrorNotice( error.message, {
					type: 'snackbar',
				} );

				onClose?.();
			},
		} );
	};

	return (
		<VStack spacing={ 6 }>
			<Text>{ __( 'Are you sure you want to delete this domain forwarding rule?' ) }</Text>
			<ButtonStack justify="flex-end">
				<Button onClick={ onClose } disabled={ deleteMutation.isPending }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					onClick={ onConfirm }
					isBusy={ deleteMutation.isPending }
					disabled={ deleteMutation.isPending }
					variant="primary"
				>
					{ __( 'Delete' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
};

export default DomainForwardingDeleteModal;
