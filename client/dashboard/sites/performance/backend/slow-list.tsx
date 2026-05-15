import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { Card, CardBody, CardHeader } from '../../../components/card';
import { Text } from '../../../components/text';
import BarList from './bar-list';
import { formatMs } from './utils';

export interface SlowListItem {
	id: string;
	label: string;
	avg_ms: number;
	max_ms: number;
}

export type SlowListMetric = 'avg' | 'max';

function headlineFor( items: SlowListItem[], metric: SlowListMetric ): number {
	if ( ! items.length ) {
		return 0;
	}
	if ( metric === 'avg' ) {
		const total = items.reduce( ( sum, item ) => sum + item.avg_ms, 0 );
		return Math.round( total / items.length );
	}
	return items.reduce( ( max, item ) => Math.max( max, item.max_ms ), 0 );
}

export default function SlowList( {
	title,
	avgDescription,
	maxDescription,
	items,
	defaultMetric = 'max',
}: {
	title: string;
	avgDescription: string;
	maxDescription: string;
	items: SlowListItem[];
	defaultMetric?: SlowListMetric;
} ) {
	const [ metric, setMetric ] = useState< SlowListMetric >( defaultMetric );

	const sorted = [ ...items ].sort( ( a, b ) =>
		metric === 'avg' ? b.avg_ms - a.avg_ms : b.max_ms - a.max_ms
	);
	const rows = sorted.map( ( item ) => ( {
		id: item.id,
		label: item.label,
		value: metric === 'avg' ? item.avg_ms : item.max_ms,
	} ) );
	const headline = headlineFor( items, metric );
	const description = metric === 'avg' ? avgDescription : maxDescription;

	return (
		<Card>
			<CardHeader>
				<HStack wrap spacing={ 4 } justify="space-between" alignment="flex-start">
					<VStack spacing={ 2 } alignment="flex-start">
						<Text size="title" weight={ 500 } as="h2">
							{ title }
						</Text>
						<Text size={ 32 } weight={ 500 } lineHeight="40px">
							{ formatMs( headline ) }
						</Text>
						<Text variant="muted">{ description }</Text>
					</VStack>
					<ToggleGroupControl
						value={ metric }
						isBlock
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						onChange={ ( value ) => setMetric( ( value as SlowListMetric ) ?? defaultMetric ) }
						label={ __( 'Duration metric' ) }
						hideLabelFromVision
					>
						<ToggleGroupControlOption value="avg" label={ __( 'Avg' ) } />
						<ToggleGroupControlOption value="max" label={ __( 'Max' ) } />
					</ToggleGroupControl>
				</HStack>
			</CardHeader>
			<CardBody>
				<BarList rows={ rows } valueFormatter={ formatMs } />
			</CardBody>
		</Card>
	);
}
