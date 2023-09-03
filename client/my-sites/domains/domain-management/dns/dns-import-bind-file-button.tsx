import { Button } from '@automattic/components';
import { Icon, cloudUpload } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { useCallback, useState } from 'react';
import FilePicker from 'calypso/components/file-picker';
import wpcom from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
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

	const className = classNames( 'dns__breadcrumb-button add-record', {
		'is-icon-button': isMobile,
	} );

	const importDnsRecords = async () => {
		console.log( 'importing DNS records' );
		try {
			await wpcom.req.post(
				{
					path: `/domains/${ domain }/dns`,
					apiVersion: '1.1',
				},
				{ recordsToImport }
			);
			dispatch( successNotice( __( 'DNS records imported succesfully!' ) ) );
		} catch ( error: unknown ) {
			if ( error instanceof Error ) {
				dispatch( errorNotice( error.message ) );
				return;
			}
		} finally {
			setSubmitting( false );
		}
	};

	const closeImportBindFileDialog = ( result: boolean ) => {
		setImportBindFileConfirmationDialogIsVisible( false );
		setRecordsToImport( [] );
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
		const formData: [ string, File, string ][] = [];
		[ ...files ].forEach( ( file: File ) => {
			formData.push( [ 'files[]', file, file.name ] );
		} );

		try {
			const recordsToImport = await wpcom.req.post(
				{
					path: `/domains/dns/import/bind/${ domain }`,
					apiNamespace: 'wpcom/v2',
				},
				formData
			);
			console.log( { recordsToImport } );

			setRecordsToImport( [] );
			showImportBindFileDialog();
		} catch ( error: unknown ) {
			if ( error instanceof Error ) {
				dispatch( errorNotice( error.message ) );
			}
		} finally {
			setSubmitting( false );
		}

		// TODO: Remove this when the new endpoint is ready
		// showImportBindFileDialog();
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
