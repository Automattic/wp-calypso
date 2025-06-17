import { Card, CardBody } from '@wordpress/components';
import './styles.scss';

function DataViewsCard( { children }: { children: React.ReactNode } ) {
	return (
		<Card className="dashboard-dataviews-card">
			<CardBody>{ children }</CardBody>
		</Card>
	);
}

export default DataViewsCard;
