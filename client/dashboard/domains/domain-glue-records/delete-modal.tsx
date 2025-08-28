import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { RenderModalProps } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { domainGlueRecordDeleteMutation } from '../../app/queries/domain-glue-records';
import { domainRoute } from '../../app/router/domains';
import type { DomainGlueRecord } from '../../data/domain-glue-records';

const DomainGlueRecordDeleteModal = ( {
	items,
	closeModal,
}: RenderModalProps< DomainGlueRecord > ) => {
	const { domainName } = domainRoute.useParams();
	const deleteMutation = useMutation( domainGlueRecordDeleteMutation( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	const onConfirm = () => {
		setIsSubmitting( true );

		deleteMutation.mutate( items[ 0 ], {
			onSuccess: () => {
				createSuccessNotice( __( 'Glue record was deleted successfully.' ), {
					type: 'snackbar',
				} );

				closeModal?.();
			},
			onError: () => {
				createErrorNotice( __( 'Failed to delete glue record.' ), {
					type: 'snackbar',
				} );

				closeModal?.();
			},
		} );
	};

	return (
		<VStack spacing={ 6 }>
			<Text>{ __( 'Are you sure you want to delete this glue record?' ) }</Text>
			<HStack justify="flex-end" spacing={ 2 }>
				<Button onClick={ closeModal } disabled={ isSubmitting }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					onClick={ onConfirm }
					isBusy={ isSubmitting }
					disabled={ isSubmitting }
					variant="primary"
				>
					{ __( 'Delete' ) }
				</Button>
			</HStack>
		</VStack>
	);
};

export default DomainGlueRecordDeleteModal;
