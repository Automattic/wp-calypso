import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import SegmentedBar, { type SegmentedBarSegment } from '../../components/segmented-bar';
import { useFlexUsageCosts } from './use-flex-usage-costs';

export default function BillingFlexUsageCard( { purchaseId }: { purchaseId?: number | string } ) {
	const { parts, formatted } = useFlexUsageCosts( purchaseId );

	const segments: SegmentedBarSegment[] = parts.map( ( p ) => ( {
		id: p.id,
		value: p.amount,
		label: p.label,
	} ) );

	return (
		<Card>
			<CardHeader isBorderless>
				<SectionHeader
					title={ __( 'Plan usage' ) }
					description={ __( 'Price breakdown by resource.' ) }
					level={ 3 }
				/>
			</CardHeader>
			<CardBody>
				<VStack spacing={ 4 } alignment="stretch">
					<SegmentedBar
						segments={ segments }
						showLabels
						gap={ 6 }
						ariaLabel={ __( 'Plan usage cost breakdown' ) }
						formatValue={ ( _value, segment ) =>
							formatted.parts[ segment.id as 'storage' | 'bandwidth' | 'compute' ]
						}
					/>
				</VStack>
			</CardBody>
		</Card>
	);
}
