import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../../../components/card';

export default function ChartSlot() {
	return (
		<Card>
			<CardBody>
				<div style={ { minHeight: 320, display: 'grid', placeItems: 'center' } }>
					<Text variant="muted">{ __( 'Response time chart coming soon.' ) }</Text>
				</div>
			</CardBody>
		</Card>
	);
}
