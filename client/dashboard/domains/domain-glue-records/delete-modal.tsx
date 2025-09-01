import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { domainGlueRecordDeleteMutation } from '../../app/queries/domain-glue-records';
import type { DomainGlueRecord } from '../../data/domain-glue-records';

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
	const deleteMutation = useMutation( domainGlueRecordDeleteMutation( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const onConfirm = () => {
		deleteMutation.mutate( glueRecord, {
			onSuccess: () => {
				createSuccessNotice( __( 'Glue record was deleted successfully.' ), {
					type: 'snackbar',
				} );

				onClose?.();
			},
			onError: () => {
				createErrorNotice( __( 'Failed to delete glue record.' ), {
					type: 'snackbar',
				} );

				onClose?.();
			},
		} );
	};

	return (
		<VStack spacing={ 6 }>
			<Text>{ __( 'Are you sure you want to delete this glue record?' ) }</Text>
			<HStack justify="flex-end" spacing={ 2 }>
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
			</HStack>
		</VStack>
	);
};

export default DomainGlueRecordDeleteModal;
