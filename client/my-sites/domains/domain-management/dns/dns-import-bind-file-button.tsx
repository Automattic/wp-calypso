import { Button } from '@automattic/components';
import { Icon, cloudUpload } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import FilePicker from 'calypso/components/file-picker';
import wpcom from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { updateDns } from 'calypso/state/domains/dns/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import ImportBindFileConfirmationDialog from './import-bind-file-confirmation-dialog';
import { DnsImportBindFileButtonProps, ImportedDnsRecord } from './types';

function DnsImportBindFileButton( { domain, isMobile }: DnsImportBindFileButtonProps ) {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const [
		importBindFileConfirmationDialogIsVisible,
		setImportBindFileConfirmationDialogIsVisible,
	] = useState( false );
	const [ submitting, setSubmitting ] = useState( false );
	const [ recordsToImport, setRecordsToImport ] = useState< ImportedDnsRecord[] | null >( null );

	const numberOfSelectedRecords = recordsToImport?.reduce( ( numberOfSelectedRecords, record ) => {
		return numberOfSelectedRecords + ( record.selected ? 1 : 0 );
	}, 0 );

	const toggleRecord = ( recordIndex: number ) => {
		if ( ! recordsToImport ) {
			return;
		}

		const newRecordsToImport = [ ...recordsToImport ];
		newRecordsToImport[ recordIndex ].selected = ! newRecordsToImport[ recordIndex ].selected;
		setRecordsToImport( newRecordsToImport );
	};

	const toggleAllRecords = () => {
		if ( ! recordsToImport ) {
			return;
		}

		const newSelectedState = numberOfSelectedRecords !== recordsToImport?.length;
		const newRecordsToImport = [ ...recordsToImport ];
		newRecordsToImport.forEach( ( record: ImportedDnsRecord ) => {
			record.selected = newSelectedState;
		} );
		setRecordsToImport( newRecordsToImport );
	};

	const className = clsx( 'dns__breadcrumb-button import-bind-file', {
		'is-icon-button': isMobile,
	} );

	const importDnsRecords = async () => {
		try {
			const selectedRecordsToImport = recordsToImport?.filter( ( record ) => record.selected );
			await dispatch( updateDns( domain, selectedRecordsToImport, [] ) );
			dispatch( successNotice( __( 'BIND file imported succesfully!' ) ) );
		} catch ( error: unknown ) {
			if ( error instanceof Error ) {
				dispatch( errorNotice( error.message ) );
			}
		} finally {
			setSubmitting( false );
		}
	};

	const closeImportBindFileDialog = ( result: boolean ) => {
		setImportBindFileConfirmationDialogIsVisible( false );
		if ( result ) {
			importDnsRecords();
		}
	};

	const showImportBindFileDialog = useCallback(
		() => setImportBindFileConfirmationDialogIsVisible( true ),
		[]
	);

	const onFileSelected = async ( files: FileList ) => {
		if ( ! files || files.length === 0 ) {
			return;
		}

		setSubmitting( true );

		const formData = [ [ 'files[]', files[ 0 ], files[ 0 ].name ] ];

		try {
			const recordsToImport = await wpcom.req.post( {
				path: `/domains/dns/import/bind/${ domain }`,
				apiNamespace: 'wpcom/v2',
				formData,
			} );

			const processedRecordsToImport = recordsToImport.map( ( record: ImportedDnsRecord ) => {
				record.selected = true;
				return record;
			} );

			setRecordsToImport( processedRecordsToImport );
			showImportBindFileDialog();
		} catch ( error: unknown ) {
			if ( error instanceof Error ) {
				dispatch( errorNotice( error.message ) );
			}
		} finally {
			setSubmitting( false );
		}
	};

	return (
		<>
			<ImportBindFileConfirmationDialog
				numberOfSelectedRecords={ numberOfSelectedRecords }
				onClose={ closeImportBindFileDialog }
				recordsToImport={ recordsToImport }
				toggleAllRecords={ toggleAllRecords }
				toggleRecord={ toggleRecord }
				visible={ importBindFileConfirmationDialogIsVisible }
			/>

			<FilePicker onPick={ onFileSelected }>
				<Button borderless={ isMobile } disabled={ submitting } className={ className }>
					<Icon icon={ cloudUpload } viewBox="4 4 16 16" size={ 16 } />
					{ ! isMobile && __( 'Import BIND file' ) }
				</Button>
			</FilePicker>
		</>
	);
}

export default DnsImportBindFileButton;
