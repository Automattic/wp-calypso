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

	const renderRecordAsString = ( record ) => {
		const recordAsString = `${ record.host } ${ record.class } ${ record.type }`;
		switch ( record.type ) {
			case 'A':
			case 'AAAA':
			case 'CNAME':
			case 'NS':
			case 'TXT':
				return `${ recordAsString } ${ record.data }`;
			case 'MX':
				return `${ recordAsString } ${ record.aux } ${ record.data }`;
			case 'SRV':
				return `${ record.service }.${ record.protocol }.${ recordAsString } ${ record.aux } ${ record.weight } ${ record.port } ${ record.data }`;
		}
	};

	const renderImportedRecords = () => {
		let records = '';
		recordsToImport.forEach( ( record ) => {
			records += renderRecordAsString( record ) + '\n';
		} );
		return records;
	};

	return (
		<Dialog
			isVisible={ visible }
			buttons={ recordsToImport && recordsToImport.length > 0 ? buttons : okButton }
			onClose={ onCancel }
		>
			<h1>{ __( 'Import DNS records' ) }</h1>
			{ recordsToImport && recordsToImport.length > 0 ? (
				<>
					<p>{ __( 'The following DNS records will be added to your domain:' ) }</p>
					<pre className="import-records-dialog__records">{ renderImportedRecords() }</pre>
				</>
			) : (
				<p>{ __( "We couldn't find valid DNS records in the selected BIND file." ) }</p>
			) }
		</Dialog>
	);
}

export default ImportBindFileConfirmationDialog;
