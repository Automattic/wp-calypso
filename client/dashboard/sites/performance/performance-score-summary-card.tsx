import { Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface PerformanceScoreSummaryCardProps {
	score: string;
}

export function PerformanceScoreSummaryCard( { score }: PerformanceScoreSummaryCardProps ) {
	return (
		<Card>
			<CardBody>
				<div>{ __( 'Performance Score' ) }</div>
				<div>{ Math.round( score * 100 ) } / 100</div>
			</CardBody>
		</Card>
	);
}
