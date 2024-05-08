import { Dialog } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';

function ImportBindFileConfirmationDialog( {
	numberOfSelectedRecords,
	onClose,
	recordsToImport,
	toggleAllRecords,
	toggleRecord,
	visible,
} ) {
	const { __, _n } = useI18n();

	const onImportRecords = () => {
		onClose( true );
	};

	const onCancel = () => {
		onClose( false );
	};

	const importButtons = [
		{
			action: 'cancel',
			label: __( 'Cancel' ),
		},
		{
			action: 'import',
			label: __( 'Import records' ),
			isPrimary: true,
			onClick: onImportRecords,
			disabled: numberOfSelectedRecords === 0,
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
			default:
				return recordAsString;
		}
	};

	const renderHeader = () => {
		const headerLabel = sprintf(
			/* translators: %d is the number of selected DNS records to be imported into a domain */
			_n( '%d record selected', '%d records selected', numberOfSelectedRecords ),
			numberOfSelectedRecords
		);

		return (
			<div className="import-bind-file-confirmation-dialog__header">
				<CheckboxControl
					__nextHasNoMarginBottom
					checked={ numberOfSelectedRecords === recordsToImport?.length }
					indeterminate={
						numberOfSelectedRecords > 0 && numberOfSelectedRecords < recordsToImport?.length
					}
					onChange={ () => toggleAllRecords() }
					label={ headerLabel }
				/>
			</div>
		);
	};

	const renderRecordRow = ( record, index ) => {
		const className = clsx( 'import-bind-file-confirmation-dialog__row', {
			'not-selected': ! record.selected,
		} );

		return (
			<div key={ index } className={ className }>
				<CheckboxControl
					__nextHasNoMarginBottom
					checked={ record.selected }
					onChange={ () => toggleRecord( index ) }
					label={ renderRecordAsString( record ) }
				/>
			</div>
		);
	};

	const renderImportedRecords = () => {
		return [
			renderHeader(),
			recordsToImport.map( ( record, index ) => {
				return renderRecordRow( record, index );
			} ),
		];
	};

	return (
		<Dialog
			isVisible={ visible }
			buttons={ recordsToImport?.length > 0 ? importButtons : okButton }
			onClose={ onCancel }
			className="import-bind-file-confirmation-dialog"
		>
			<h1>{ __( 'Import DNS records' ) }</h1>
			{ recordsToImport?.length > 0 ? (
				<>
					<p>{ __( "Please select which DNS records you'd like to import to your domain:" ) }</p>
					<div>{ renderImportedRecords() }</div>
				</>
			) : (
				<p>{ __( "We couldn't find valid DNS records in the selected BIND file." ) }</p>
			) }
		</Dialog>
	);
}

export default ImportBindFileConfirmationDialog;
