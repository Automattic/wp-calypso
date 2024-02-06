import { Button, FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Dispatch, SetStateAction, useState } from 'react';
import FilePicker from 'calypso/components/file-picker';
import FormTextarea from 'calypso/components/forms/form-textarea';
import CSVColumnConfirmation from './csv-column-confirmation';

export default function SitesInput( {
	detectedSites,
	setDetectedSites,
	detectedFilename,
	setDetectedFilename,
	onCSVLoad,
	onCSVLoadConfirmation,
}: {
	detectedSites: string[];
	setDetectedSites: Dispatch< SetStateAction< string[] > >;
	detectedFilename: string;
	setDetectedFilename: Dispatch< SetStateAction< string > >;
	onCSVLoad: ( lines: string[] ) => void;
	onCSVLoadConfirmation: ( column: string ) => void;
} ) {
	const translate = useTranslate();
	const [ column, setColumn ] = useState( '' );

	let fileReader: any;

	const handleFileRead = () => {
		const content = fileReader.result;
		const lines = content.split( /\r\n|\n/ ).filter( ( line: string ) => line !== '' );

		onCSVLoad( lines );
	};

	const onFilePick = ( files: File[] ) => {
		fileReader = new FileReader();
		fileReader.onloadend = handleFileRead;
		fileReader.readAsText( files[ 0 ] );
		setDetectedFilename( files[ 0 ].name );
	};

	const onTextareaChange = ( event: any ) =>
		setDetectedSites(
			0 === event.target.value.length
				? []
				: event.target.value
						.split( /,|\n/ )
						.filter( ( url: string ) => url.trim() !== '' )
						.map( ( url: string ) => url.trim() )
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
			<FormLabel>{ detectedFilename }</FormLabel>
			<div className="connect-url__file-picker-url-count">
				{ translate( '%(num)d sites detected', { args: { num: detectedSites.length } } ) }
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
					{ '' === detectedFilename ? filePicker : uploadResults }
				</FilePicker>
				{ detectedFilename && (
					<CSVColumnConfirmation
						columns={ [ 'id', 'domain', 'site title' ] }
						onColumnSelect={ setColumn }
						column={ column }
					/>
				) }
			</div>

			<Button
				primary
				disabled={ 0 === detectedSites.length }
				onClick={ () => onCSVLoadConfirmation( column ) }
			>
				{ 0 === detectedSites.length && column
					? translate( 'Add sites' )
					: translate( 'Add %(num)d sites', { args: { num: detectedSites.length } } ) }
			</Button>
		</>
	);
}
