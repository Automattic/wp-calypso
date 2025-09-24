import { Card, CardBody } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

interface PerformanceTimesSummaryCardProps {
	fcp: number;
	lcp: number;
	cls: number;
	inp: number;
	ttfb: number;
}

export function PerformanceTimesSummaryCard( scores: PerformanceTimesSummaryCardProps ) {
	return (
		<Card>
			<CardBody>
				<div>{ __( 'First Contentful Paint' ) }</div>
				<div>
					{
						/* translators: %s is the calculated First Contentful Paint value. */
						sprintf( __( '%s s' ), ( scores.fcp / 1000 ).toFixed( 1 ) )
					}
				</div>
				<br />

				<div>{ __( 'Largest Contentful Paint' ) }</div>
				<div>
					{
						/* translators: %s is the calculated Largest Contentful Paint value. */
						sprintf( __( '%s s' ), ( scores.lcp / 1000 ).toFixed( 1 ) )
					}
				</div>
				<br />

				<div>{ __( 'Cumulative Layout Shift' ) }</div>
				<div>
					{
						/* translators: %s is the calculated Cumulative Layout Shift value. */
						scores.cls.toFixed( 2 )
					}
				</div>
				<br />

				<div>{ __( 'Interaction to Next Paint' ) }</div>
				<div>
					{
						/* translators: %s is the calculated Interaction to Next Paint value. */
						sprintf( __( '%s ms' ), Math.round( scores.inp ) )
					}
				</div>
				<br />

				<div>{ __( 'Time to First Byte' ) }</div>
				<div>
					{
						/* translators: %s is the calculated Time to First Byte value. */
						sprintf( __( '%s s' ), ( scores.ttfb / 1000 ).toFixed( 1 ) )
					}
				</div>
			</CardBody>
		</Card>
	);
}
