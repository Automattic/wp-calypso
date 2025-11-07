import { domainGlueRecordDeleteMutation } from '@automattic/api-queries';
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
import type { DomainGlueRecord } from '@automattic/api-core';

interface DomainGlueRecordDeleteModalProps {
	glueRecord: DomainGlueRecord;
	domainName: string;
	onClose?: () => void;
}

const DomainGlueRecordDeleteModal = ( {
	glueRecord,
	domainName,
	onClose,
}: DomainGlueRecordDeleteModalProps ) => {
	const deleteMutation = useMutation( {
		...domainGlueRecordDeleteMutation( domainName ),
		meta: {
			snackbar: {
				success: __( 'Glue record deleted.' ),
			},
		},
	} );
	const { createErrorNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();

	const onConfirm = () => {
		deleteMutation.mutate( glueRecord, {
			onSuccess: () => {
				recordTracksEvent( 'calypso_dashboard_domain_glue_records_delete_record', {
					domain: domainName,
					nameserver: glueRecord.nameserver,
					address: glueRecord.ip_addresses[ 0 ],
				} );

				onClose?.();
			},
			onError: ( error: Error ) => {
				recordTracksEvent( 'calypso_dashboard_domain_glue_records_delete_record_failure', {
					domain: domainName,
					nameserver: glueRecord.nameserver,
					address: glueRecord.ip_addresses[ 0 ],
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
			<Text>{ __( 'Are you sure you want to delete this glue record?' ) }</Text>
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

export default DomainGlueRecordDeleteModal;
