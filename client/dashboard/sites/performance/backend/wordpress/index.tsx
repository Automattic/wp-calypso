import { useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader } from '../../../../components/card';
import { Text } from '../../../../components/text';
import BarList, { type BarListRow } from '../bar-list';
import { siteApmWordPressQuery } from '../mock-data';
import { formatMs } from '../utils';
import type { ApmHookUsage, ApmPluginUsage, ApmTemplateUsage, Site } from '@automattic/api-core';

function totalMs( items: Array< { total_ms: number } > ): number {
	return items.reduce( ( sum, item ) => sum + item.total_ms, 0 );
}

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

function pluginsToRows( plugins: ApmPluginUsage[] ): BarListRow[] {
	return plugins.map( ( plugin ) => ( {
		id: plugin.slug,
		label: plugin.name,
		value: plugin.total_ms,
	} ) );
}

function hooksToRows( hooks: ApmHookUsage[] ): BarListRow[] {
	return hooks.map( ( hook ) => ( {
		id: hook.name,
		label: hook.name,
		value: hook.total_ms,
	} ) );
}

function templatesToRows( templates: ApmTemplateUsage[] ): BarListRow[] {
	return templates.map( ( template ) => ( {
		id: template.template,
		label: template.template,
		value: template.total_ms,
	} ) );
}

export default function WordPress( { site }: { site: Site } ) {
	const { data } = useSuspenseQuery( siteApmWordPressQuery( site.ID ) );

	return (
		<VStack spacing={ 6 }>
			<Section
				title={ __( 'Plugins' ) }
				headline={ formatMs( totalMs( data.plugins ) ) }
				description={ __( 'Total time consumed by each active plugin in the selected period.' ) }
				rows={ pluginsToRows( data.plugins ) }
			/>
			<Section
				title={ __( 'Hooks' ) }
				headline={ formatMs( totalMs( data.hooks ) ) }
				description={ __(
					'Total time spent in the slowest action and filter hooks fired during the selected period.'
				) }
				rows={ hooksToRows( data.hooks ) }
			/>
			<Section
				title={ __( 'Templates' ) }
				headline={ formatMs( totalMs( data.templates ) ) }
				description={ __(
					'Total time spent rendering each theme template in the selected period.'
				) }
				rows={ templatesToRows( data.templates ) }
			/>
		</VStack>
	);
}
