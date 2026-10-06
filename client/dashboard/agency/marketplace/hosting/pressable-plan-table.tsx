import { formatCurrency, formatNumberCompact } from '@automattic/number-formatters';
import {
	RadioControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { DataViews } from '../../../components/dataviews';
import { getPressablePlanName } from './lib/pressable-plans';
import type { PressablePlan } from './lib/pressable-plans';
import type { AgencyProduct } from '@automattic/api-core';
import type { Field, ViewTable } from '@wordpress/dataviews';

export const CUSTOM_PLAN_OPTION = 'custom';

export interface PlanRow {
	product: AgencyProduct;
	plan: PressablePlan;
}

interface TableRow {
	value: string;
	name: string;
	installs: string;
	visits: string;
	storage: string;
	workers: string;
}

interface Props {
	rows: PlanRow[];
	/** Adds a last row for a plan sized by Pressable, past the largest one. */
	withCustom: boolean;
	/** The selected plan's slug, or `CUSTOM_PLAN_OPTION`. */
	selected: string;
	/** The plan the agency owns, which stays listed but can't be picked again. */
	currentSlug?: string;
	isPremium: boolean;
	onSelect: ( value: string ) => void;
}

const VIEW: ViewTable = {
	type: 'table',
	page: 1,
	titleField: 'name',
	fields: [ 'installs', 'visits', 'storage', 'workers' ],
	layout: {
		enableMoving: false,
		styles: {
			installs: { align: 'end' },
			visits: { align: 'end' },
			storage: { align: 'end' },
			workers: { align: 'end' },
		},
	},
};

export default function PressablePlanTable( {
	rows,
	withCustom,
	selected,
	currentSlug,
	isPremium,
	onSelect,
}: Props ) {
	const data: TableRow[] = [
		...rows.map( ( { product, plan } ) => ( {
			value: plan.slug,
			name: getPressablePlanName( product.name ),
			installs: String( plan.install ),
			visits: formatNumberCompact( plan.visits ),
			storage: sprintf(
				/* translators: %d is the size of storage in GB. */
				__( '%dGB' ),
				plan.storage
			),
			workers: String( plan.worker ),
		} ) ),
		...( withCustom
			? [
					{
						value: CUSTOM_PLAN_OPTION,
						name: __( 'Custom' ),
						// Every Premium plan is one site; a custom pooled plan is past 500.
						installs: isPremium ? '1' : __( '500+' ),
						visits: __( '10M+' ),
						storage: __( 'Custom' ),
						workers: __( 'Custom' ),
					},
				]
			: [] ),
	];

	const fields: Field< TableRow >[] = [
		{
			id: 'name',
			label: __( 'Plan' ),
			enableSorting: false,
			enableHiding: false,
			render: ( { item } ) => {
				const isCurrent = item.value === currentSlug;
				return (
					<HStack spacing={ 2 } justify="flex-start" wrap>
						<RadioControl
							label={ __( 'Plan' ) }
							hideLabelFromVision
							selected={ selected }
							options={ [ { label: item.name, value: item.value } ] }
							disabled={ isCurrent }
							onChange={ onSelect }
						/>
						{ isCurrent && <Badge intent="stable">{ __( 'Current plan' ) }</Badge> }
					</HStack>
				);
			},
		},
		{ id: 'installs', label: __( 'Installs' ), enableSorting: false, enableHiding: false },
		{ id: 'visits', label: __( 'Monthly visits' ), enableSorting: false, enableHiding: false },
		{ id: 'storage', label: __( 'Storage' ), enableSorting: false, enableHiding: false },
		{ id: 'workers', label: __( 'PHP workers' ), enableSorting: false, enableHiding: false },
	];

	return (
		<VStack spacing={ 3 }>
			<DataViews< TableRow >
				data={ data }
				fields={ fields }
				view={ VIEW }
				onChangeView={ () => {} }
				defaultLayouts={ { table: {} } }
				paginationInfo={ { totalItems: data.length, totalPages: 1 } }
				getItemId={ ( item ) => item.value }
			>
				<DataViews.Layout />
			</DataViews>
			<Text variant="muted">
				{ isPremium
					? __(
							'Every Premium plan is one site on dedicated resources, with 512MB for each PHP worker, geo-redundant HA cloud, enterprise-level caching, and hourly and daily backups.'
						)
					: sprintf(
							/* translators: %1$s is the charge per GB of storage, %2$s the charge per %3$s visits. */
							__(
								'Every plan shares its limits across all your sites, with a staging site per install and unmetered bandwidth. Over your limits, it’s %1$s per GB of storage and %2$s per %3$s visits.'
							),
							formatCurrency( 0.5, 'USD' ),
							formatCurrency( 8, 'USD' ),
							formatNumberCompact( 10000 )
						) }
			</Text>
		</VStack>
	);
}
