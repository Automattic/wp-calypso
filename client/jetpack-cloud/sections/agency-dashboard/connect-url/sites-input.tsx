import { Button, FormLabel } from '@automattic/components';
import { parse } from 'csv-parse/browser/esm/sync';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FilePicker from 'calypso/components/file-picker';
import FormTextarea from 'calypso/components/forms/form-textarea';
import CSVColumnConfirmation from './csv-column-confirmation';

export default function SitesInput( {
	sites,
	setSites,
	filename,
	setFilename,
	csvColumns,
	onCSVLoad,
	onCSVLoadConfirmation,
}: {
	sites: string[][];
	setSites: ( sites: string[][] ) => void;
	filename: string;
	setFilename: ( filename: string ) => void;
	csvColumns: string[];
	onCSVLoad: ( lines: string[][] ) => void;
	onCSVLoadConfirmation: ( column: string ) => void;
} ) {
	const translate = useTranslate();
	const [ column, setColumn ] = useState( '' );

	let fileReader: any;

	const handleFileRead = () => {
		if ( typeof fileReader.result !== 'string' ) {
			// @todo error handling.
			return;
		}

		// @todo error handling
		const lines = parse( fileReader.result, {
			skip_empty_lines: true,
		} );

		onCSVLoad( lines );
	};

	const onFilePick = ( files: File[] ) => {
		fileReader = new FileReader();
		fileReader.onloadend = handleFileRead;
		fileReader.readAsText( files[ 0 ] );
		setFilename( files[ 0 ].name );
	};

	const onTextareaChange = ( event: any ) =>
		setSites(
			0 === event.target.value.trim().length
				? []
				: event.target.value
						.split( /[\r\n,]+/ )
						.map( ( url: string ) => url.trim() )
						.filter( ( url: string ) => url !== '' )
		);

	const filePicker = (
		<>
			<div className="connect-url__file-picker-text">{ translate( 'Drop file to upload' ) }</div>
			<div className="connect-url__file-picker-text">{ translate( 'or' ) }</div>
			<div className="connect-url__file-picker-text">
				<Button className="connect-url__file-picker-button">{ translate( 'Select file' ) }</Button>
			</div>
		</>
	);

	const uploadResults = (
		<>
			<FormLabel>{ filename }</FormLabel>
			<div className="connect-url__file-picker-url-count">
				{ translate( '%(num)d sites detected', { args: { num: sites.length } } ) }
			</div>
		</>
	);

	return (
		<>
			<FormLabel>{ translate( 'Enter site URLs:' ) }</FormLabel>
			<FormTextarea
				className="connect-url__site-urls-field"
				placeholder={ translate( 'E.g.: www.totoros.blog, www.totoro.org' ) }
				onChange={ onTextareaChange }
			></FormTextarea>
			<div className="connect-url__form-instruction">
				{ translate( 'Separate each site with a comma' ) }
			</div>
			<FormLabel>{ translate( 'Or upload a CSV file:' ) }</FormLabel>

			<div className="connect-url__file-picker">
				<FilePicker accept=".csv,.txt" onPick={ onFilePick }>
					{ '' === filename ? filePicker : uploadResults }
				</FilePicker>
				{ filename && csvColumns.length > 0 && (
					<CSVColumnConfirmation
						columns={ csvColumns }
						onColumnSelect={ setColumn }
						column={ column }
					/>
				) }
			</div>

			<Button
				primary
				disabled={ 0 === sites.length || ! column }
				onClick={ () => onCSVLoadConfirmation( column ) }
			>
				{ 0 === sites.length && column
					? translate( 'Add sites' )
					: translate( 'Add %(num)d sites', { args: { num: sites.length } } ) }
			</Button>
		</>
	);
}
