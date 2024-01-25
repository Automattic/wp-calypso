import { Button } from '@automattic/components';

export default function CSVColumnConfirmation( {
	csvColumns,
	setURLColumn,
}: {
	csvColumns: string[];
	setURLColumn: ( option: string ) => void;
} ) {
	return (
		<div>
			<h1>CSV Column Confirmation</h1>
			{ csvColumns.map( ( option: string ) => (
				<Button key={ option } onClick={ () => setURLColumn( option ) }>
					{ option }
				</Button>
			) ) }
		</div>
	);
}
