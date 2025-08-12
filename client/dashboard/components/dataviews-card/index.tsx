import { Card, CardBody } from '@wordpress/components';

function DataViewsCard( { children }: { children: React.ReactNode } ) {
	return (
		<Card>
			<CardBody>{ children }</CardBody>
		</Card>
	);
}

export default DataViewsCard;
