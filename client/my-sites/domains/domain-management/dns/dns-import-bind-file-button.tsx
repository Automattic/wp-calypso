import { Button } from '@automattic/components';
import { Icon, cloudUpload } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { useCallback, useState } from 'react';
import FilePicker from 'calypso/components/file-picker';
import wpcom from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { updateDns } from 'calypso/state/domains/dns/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import ImportBindFileConfirmationDialog from './import-bind-file-confirmation-dialog';
import { DnsImportBindFileButtonProps } from './types';

function DnsImportBindFileButton( { domain, isMobile }: DnsImportBindFileButtonProps ) {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const [
		importBindFileConfirmationDialogIsVisible,
		setImportBindFileConfirmationDialogIsVisible,
	] = useState( false );
	const [ submitting, setSubmitting ] = useState( false );
	const [ recordsToImport, setRecordsToImport ] = useState< string[] | null >( null );

	const className = classNames( 'dns__breadcrumb-button import-bind-file', {
		'is-icon-button': isMobile,
	} );

	const importDnsRecords = async () => {
		try {
			await dispatch( updateDns( domain, recordsToImport, [] ) );
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

			setRecordsToImport( recordsToImport );
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
				visible={ importBindFileConfirmationDialogIsVisible }
				onClose={ closeImportBindFileDialog }
				recordsToImport={ recordsToImport }
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
