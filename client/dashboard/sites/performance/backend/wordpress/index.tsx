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
	description,
	rows,
}: {
	title: string;
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

export default function WordPress( { merged }: { merged: MergedAggregate } ) {
	const pluginRows = pluginsToRows( merged.slowest.plugins );
	const hookRows = hooksToRows( merged.slowest.hooks );
	const templateRows = templatesToRows( merged.slowest.templates );

	return (
		<VStack spacing={ 6 }>
			<Section
				title={ __( 'Plugins' ) }
				description={ __(
					'Time consumed by each active plugin across requests in the selected period.'
				) }
				rows={ pluginRows }
			/>
			<Section
				title={ __( 'Hooks' ) }
				description={ __(
					'Time spent in the slowest action and filter hooks fired across requests in the selected period.'
				) }
				rows={ hookRows }
			/>
			<Section
				title={ __( 'Templates' ) }
				description={ __(
					'Time spent rendering each theme template across requests in the selected period.'
				) }
				rows={ templateRows }
			/>
		</VStack>
	);
}
