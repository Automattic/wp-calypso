import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader } from '../../../../components/card';
import { Text } from '../../../../components/text';
import {
	type MergedAggregate,
	type MergedHook,
	type MergedPlugin,
	type MergedTemplate,
} from '../aggregate';
import BarList, { type BarListRow } from '../bar-list';
import { formatMs } from '../utils';

function Section( {
	title,
	headline,
	description,
	rows,
}: {
	title: string;
	headline: string;
	description: string;
	rows: BarListRow[];
} ) {
	return (
		<Card>
			<CardHeader>
				<HStack wrap spacing={ 4 } justify="space-between" alignment="flex-start">
					<VStack spacing={ 2 } alignment="flex-start">
						<Text size="title" weight={ 500 } as="h2">
							{ title }
						</Text>
						<Text size={ 32 } weight={ 500 } lineHeight="40px">
							{ headline }
						</Text>
						<Text variant="muted">{ description }</Text>
					</VStack>
				</HStack>
			</CardHeader>
			<CardBody>
				<BarList rows={ rows } valueFormatter={ formatMs } />
			</CardBody>
		</Card>
	);
}

function pluginsToRows( plugins: MergedPlugin[] ): BarListRow[] {
	return plugins.map( ( plugin ) => ( {
		id: plugin.id,
		label: plugin.name,
		value: plugin.self_sum_ms,
	} ) );
}

function hooksToRows( hooks: MergedHook[] ): BarListRow[] {
	return hooks.map( ( hook ) => ( {
		id: hook.id,
		label: hook.action,
		value: hook.total_sum_ms,
	} ) );
}

function templatesToRows( templates: MergedTemplate[] ): BarListRow[] {
	return templates.map( ( template ) => ( {
		id: template.id,
		label: template.name,
		value: template.total_sum_ms,
	} ) );
}

function sumValues( rows: BarListRow[] ): number {
	return rows.reduce( ( sum, row ) => sum + row.value, 0 );
}

export default function WordPress( { merged }: { merged: MergedAggregate } ) {
	const pluginRows = pluginsToRows( merged.slowest.plugins );
	const hookRows = hooksToRows( merged.slowest.hooks );
	const templateRows = templatesToRows( merged.slowest.templates );

	return (
		<VStack spacing={ 6 }>
			<Section
				title={ __( 'Plugins' ) }
				headline={ formatMs( sumValues( pluginRows ) ) }
				description={ __( 'Total time consumed by each active plugin in the selected period.' ) }
				rows={ pluginRows }
			/>
			<Section
				title={ __( 'Hooks' ) }
				headline={ formatMs( sumValues( hookRows ) ) }
				description={ __(
					'Total time spent in the slowest action and filter hooks fired during the selected period.'
				) }
				rows={ hookRows }
			/>
			<Section
				title={ __( 'Templates' ) }
				headline={ formatMs( sumValues( templateRows ) ) }
				description={ __(
					'Total time spent rendering each theme template in the selected period.'
				) }
				rows={ templateRows }
			/>
		</VStack>
	);
}
