import { Button, FormLabel } from '@automattic/components';
import { parse } from 'csv-parse/browser/esm/sync';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import FilePicker from 'calypso/components/file-picker';
import FormTextarea from 'calypso/components/forms/form-textarea';
import CSVColumnConfirmation from './csv-column-confirmation';

export default function SitesInput( { onConfirm }: { onConfirm: ( sites: string[] ) => void } ) {
	const translate = useTranslate();
	const [ inputSites, setInputSites ] = useState( [] as string[] );
	const [ csvSites, setCsvSites ] = useState( [] as string[] );
	const [ csvFilename, setCsvFilename ] = useState( '' );
	const [ rows, setRows ] = useState( [] as string[][] );
	const [ csvColumn, setCsvColumn ] = useState( '' );
	const csvColumns = rows?.[ 0 ] || [];
	const columnIndex = csvColumns.indexOf( csvColumn );
	const sites = [ ...inputSites, ...csvSites ];

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

		if ( lines.length < 2 ) {
			// @todo error handling
			return;
		}

		setRows( lines );
	};

	const onFilePick = ( files: File[] ) => {
		fileReader = new FileReader();
		fileReader.onloadend = handleFileRead;
		fileReader.readAsText( files[ 0 ] );
		setCsvFilename( files[ 0 ].name );
	};

	const onTextareaChange = ( event: any ) =>
		setInputSites(
			0 === event.target.value.trim().length
				? []
				: event.target.value
						.split( /[\r\n,]+/ )
						.map( ( url: string ) => url.trim() )
						.filter( ( url: string ) => url !== '' )
		);

	useEffect( () => {
		setCsvSites(
			rows
				.slice( 1 )
				.map( ( line: string[] ) => line?.[ columnIndex ] || '' )
				.filter( ( url: string ) => !! url )
		);
	}, [ rows, columnIndex ] );

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
			<FormLabel>{ csvFilename }</FormLabel>
			<div className="connect-url__file-picker-url-count">
				{ translate( '%(num)d sites detected', { args: { num: rows.length - 1 } } ) }
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
					{ '' === csvFilename ? filePicker : uploadResults }
				</FilePicker>
				{ csvFilename && csvColumns.length > 0 && (
					<CSVColumnConfirmation
						columns={ csvColumns }
						onColumnSelect={ setCsvColumn }
						column={ csvColumn }
					/>
				) }
			</div>

			<Button
				primary
				disabled={ sites.length < 1 || ( rows.length > 0 && columnIndex < 0 ) }
				onClick={ () => onConfirm( sites ) }
			>
				{ 0 === sites.length
					? translate( 'Add sites' )
					: translate( 'Add %(num)d sites', { args: { num: sites.length } } ) }
			</Button>
		</>
	);
}
