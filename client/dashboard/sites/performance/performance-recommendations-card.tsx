import { Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface PerformanceRecommendationsCardProps {
	audits: any[];
}

export function PerformanceRecommendationsCard( { audits }: PerformanceRecommendationsCardProps ) {
	const filteredAudits = Object.keys( audits );

	return (
		<Card>
			<CardBody>
				<div>{ __( 'Recommendations' ) }</div>

				<div>
					{ filteredAudits.map( ( audit ) => {
						return (
							<div>
								{ audits[ audit ].title } - { audits[ audit ].displayValue }
							</div>
						);
					} ) }
				</div>
			</CardBody>
		</Card>
	);
}
