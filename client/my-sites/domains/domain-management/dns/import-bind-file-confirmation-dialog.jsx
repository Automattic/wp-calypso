import { Dialog } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';

function ImportBindFileConfirmationDialog( { onClose, visible, recordsToImport } ) {
	const { __ } = useI18n();

	const onImportRecords = () => {
		onClose( true );
	};

	const onCancel = () => {
		onClose( false );
	};

	const buttons = [
		{
			action: 'cancel',
			label: __( 'Cancel' ),
		},
		{
			action: 'import',
			label: __( 'Import records' ),
			isPrimary: true,
			onClick: onImportRecords,
		},
	];

	const okButton = [
		{
			action: 'cancel',
			label: __( 'Ok' ),
		},
	];

	const renderImportedRecords = () => {
		if ( ! recordsToImport ) {
			return '';
		}

		let records = '';
		console.log( 'recordsToImport' );
		console.log( recordsToImport );
		( recordsToImport || [] ).forEach( ( record ) => {
			records += `${ record }\n`;
		} );
		return records;
	};

	return (
		<Dialog
			isVisible={ visible }
			buttons={ recordsToImport ? buttons : okButton }
			onClose={ onCancel }
		>
			<h1>{ __( 'Import DNS records' ) }</h1>
			{ recordsToImport ? (
				<>
					<p>{ __( 'The following DNS records will be added to your domain:' ) }</p>
					<code className="import-records-dialog__records">{ renderImportedRecords() }</code>
				</>
			) : (
				<p>{ __( 'We could not find valid DNS records in the file you chose' ) }</p>
			) }
		</Dialog>
	);
}

export default ImportBindFileConfirmationDialog;
