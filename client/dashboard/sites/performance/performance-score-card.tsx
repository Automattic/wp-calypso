import { Badge } from '@automattic/ui';
import { Button, Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PerformanceScoreExplanation } from './performance-score-explanation';

interface PerformanceScoreCardProps {
	scores: any[];
}

export function PerformanceScoreCard( { scores }: PerformanceScoreCardProps ) {
	const needsImprovement = scores.audits ? (
		<Badge intent="warning">{ __( 'Needs improvement' ) }</Badge>
	) : (
		''
	);

	return (
		<Card>
			<CardBody>
				<h3>{ __( 'Performance score' ) }</h3>
				<div>{ needsImprovement }</div>
				<Button variant="secondary">{ __( 'View all recommendations' ) }</Button>

				<div>{ Math.round( scores.overall_score * 100 ) } / 100</div>

				<PerformanceScoreExplanation />
			</CardBody>
		</Card>
	);
}
