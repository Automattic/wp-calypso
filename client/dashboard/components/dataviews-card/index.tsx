import { Card, CardBody } from '@wordpress/components';

function DataViewsCard( { children }: { children: React.ReactNode } ) {
	return (
		<Card>
			<CardBody style={ { padding: 0, overflow: 'hidden' } }>{ children }</CardBody>
		</Card>
	);
}

export default DataViewsCard;
