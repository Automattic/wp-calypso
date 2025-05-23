import { Card, CardBody } from '@wordpress/components';

function DataViewsCard( { children }: { children: React.ReactNode } ) {
	return (
		<Card>
			<CardBody style={ { paddingLeft: 0, paddingRight: 0 } }>{ children }</CardBody>
		</Card>
	);
}

export default DataViewsCard;
