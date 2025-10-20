import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Card,
	CardBody,
	ProgressBar,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Valuation } from '../../utils/site-performance';
import { CoreMetricsStatusBadge } from './core-metrics-status-badge';

export default function CoreMetricsExplanation( {
	screenshot,
	value,
	status,
}: {
	screenshot: string;
	value: number;
	status: Valuation;
} ) {
	return (
		<Card>
			<CardBody>
				<HStack expanded>
					<VStack expanded>
						<Text size="title" weight={ 500 } as="h2">
							{ __( 'Performance Score' ) }
						</Text>
						<Text size="title" weight={ 500 } as="h2">
							{ Math.floor( value * 100 ) } / 100
						</Text>
						<ProgressBar value={ value * 100 } />
						<CoreMetricsStatusBadge value={ status } />
					</VStack>
					{ screenshot && (
						<img
							style={ {
								border: '1px solid #e0e0e0',
								borderRadius: '4px',
								height: '280px',
								width: 'auto',
							} }
							src={ screenshot }
							alt={ __( 'Performance Score' ) }
						/>
					) }
				</HStack>
			</CardBody>
		</Card>
	);
}
