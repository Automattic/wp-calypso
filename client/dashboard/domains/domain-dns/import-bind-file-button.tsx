import { useMutation } from '@tanstack/react-query';
import { Button, FormFileUpload } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { domainDnsImportBindMutation } from '../../app/queries/domain-dns-records';
import type { DnsRecord } from '@automattic/api-core';

interface ImportBindFileButtonProps {
	domainName: string;
	onRecordsImported: ( data: DnsRecord[] ) => void;
}

export default function ImportBindFileButton( {
	domainName,
	onRecordsImported,
}: ImportBindFileButtonProps ) {
	const { createErrorNotice } = useDispatch( noticesStore );
	const importDnsBindMutation = useMutation( domainDnsImportBindMutation( domainName ) );

	const handleFileChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const file = event.currentTarget.files?.[ 0 ];
		if ( ! file ) {
			return;
		}

		importDnsBindMutation.mutate( file, {
			onSuccess: ( data ) => {
				onRecordsImported( data );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to import DNS records.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	return (
		<FormFileUpload
			accept="text/plain"
			multiple={ false }
			onChange={ handleFileChange }
			render={ ( { openFileDialog } ) => (
				<Button
					variant="secondary"
					__next40pxDefaultSize
					onClick={ openFileDialog }
					isBusy={ importDnsBindMutation.isPending }
				>
					{ __( 'Import BIND file' ) }
				</Button>
			) }
		/>
	);
}
