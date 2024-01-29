import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormRadio from 'calypso/components/forms/form-radio';

export default function CSVColumnConfirmation( {
	csvColumns,
	setURLColumn,
}: {
	csvColumns: string[];
	setURLColumn: ( option: string ) => void;
} ) {
	const translate = useTranslate();
	const [ selectedColumn, setSelectedColumn ] = useState( '' );
	const columnCard = ( option: string ) => (
		<Card
			key={ option }
			className="connect-url-csv-column-confirmation__column-card"
			onClick={ () => {
				setSelectedColumn( option );
				setURLColumn( option );
			} }
		>
			<FormRadio
				claasName="connect-url-csv-column-confirmation__column-card-radio"
				label={ option }
				name="url-column"
				value={ option }
				checked={ option === selectedColumn }
			/>
		</Card>
	);

	const columnCards = csvColumns.map( columnCard );

	return (
		<div className="connect-url-csv-column-confirmation">
			<h2 className="connect-url-csv-column-confirmation__page-title">
				{ translate( 'Columns from your CSV file' ) }
			</h2>
			<div className="connect-url-csv-column-confirmation__page-subtitle">
				{ translate(
					'Choose which column from the CSV file represents the site URL for each site.'
				) }
			</div>
			{ columnCards }
		</div>
	);
}
