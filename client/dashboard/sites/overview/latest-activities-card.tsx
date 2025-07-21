import { Card, CardHeader, CardBody } from '@wordpress/components';
import { SectionHeader } from '../../components/section-header';

export default function LatestActivitiesCard() {
	return (
		<Card>
			<CardHeader>
				<SectionHeader title="Latest activities" level={ 3 } />
			</CardHeader>
			<CardBody>TBA</CardBody>
		</Card>
	);
}
