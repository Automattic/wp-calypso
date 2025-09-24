import { Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface PerformancePageLoadTimelineCardProps {
	screenshots: any[];
}

export function PerformancePageLoadTimelineCard( {
	screenshots,
}: PerformancePageLoadTimelineCardProps ) {
	return (
		<Card>
			<CardBody>
				<div>{ __( 'Page load timeline' ) }</div>
				<div>
					{ screenshots.map( ( screenshot, index ) => {
						const timing = `${ ( screenshot.timing / 1000 ).toFixed( 1 ) }s`;
						return (
							<div key={ index } style={ { float: 'left' } }>
								<img alt={ timing } src={ screenshot.data } />
								<div>{ timing }</div>
							</div>
						);
					} ) }
				</div>
			</CardBody>
		</Card>
	);
}
