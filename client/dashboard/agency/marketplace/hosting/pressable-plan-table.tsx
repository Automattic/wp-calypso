import { formatCurrency, formatNumberCompact } from '@automattic/number-formatters';
import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import clsx from 'clsx';
import { getPressablePlanName } from './lib/pressable-plans';
import type { PressablePlan } from './lib/pressable-plans';
import type { AgencyProduct } from '@automattic/api-core';

export const CUSTOM_PLAN_OPTION = 'custom';

export interface PlanRow {
	product: AgencyProduct;
	plan: PressablePlan;
}

interface Props {
	rows: PlanRow[];
	/** Adds a last row for a plan sized by Pressable, past the largest one. */
	withCustom: boolean;
	/** The selected plan's slug, or `CUSTOM_PLAN_OPTION`. */
	selected: string;
	/** The plan the agency owns, which stays visible but can't be picked again. */
	currentSlug?: string;
	isPremium: boolean;
	onSelect: ( value: string ) => void;
}

interface TableRow {
	value: string;
	name: string;
	installs: string;
	visits: string;
	storage: string;
	workers: string;
}

/**
 * Every plan of the chosen type as a row, its limits in columns, so plans
 * compare side by side. The limits every plan shares sit in one note under it.
 */
export default function PressablePlanTable( {
	rows,
	withCustom,
	selected,
	currentSlug,
	isPremium,
	onSelect,
}: Props ) {
	const tableRows: TableRow[] = [
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
						installs: __( '500+' ),
						visits: __( '10M+' ),
						storage: __( 'Custom' ),
						workers: __( 'Custom' ),
					},
				]
			: [] ),
	];
	const isSmallScreen = useViewportMatch( 'small', '<' );
	// Premium plans are all one site: a column of 1s says nothing.
	const showInstalls = new Set( rows.map( ( { plan } ) => plan.install ) ).size > 1;
	// On phones the table keeps the columns that tell plans apart, so it fits the card.
	const showMoreColumns = ! isSmallScreen;

	return (
		<VStack spacing={ 3 } alignment="stretch">
			<div className="dashboard-marketplace-hosting__plan-table-scroll">
				<table className="dashboard-marketplace-hosting__plan-table">
					<thead>
						<tr>
							<th scope="col">{ __( 'Plan' ) }</th>
							{ showInstalls && <th scope="col">{ __( 'Installs' ) }</th> }
							{ showInstalls && showMoreColumns && <th scope="col">{ __( 'Staging sites' ) }</th> }
							<th scope="col">
								{ isSmallScreen ? __( 'Monthly visits' ) : __( 'Visits a month' ) }
							</th>
							<th scope="col">{ __( 'Storage' ) }</th>
							{ showMoreColumns && <th scope="col">{ __( 'PHP workers' ) }</th> }
						</tr>
					</thead>
					<tbody>
						{ tableRows.map( ( row ) => {
							const isCurrent = row.value === currentSlug;
							return (
								<tr
									key={ row.value }
									className={ clsx( {
										'is-selected': row.value === selected,
										'is-current': isCurrent,
									} ) }
									onClick={ () => ! isCurrent && onSelect( row.value ) }
								>
									<td>
										<label>
											<input
												type="radio"
												name="dashboard-marketplace-hosting-pressable-plan"
												value={ row.value }
												checked={ row.value === selected }
												disabled={ isCurrent }
												onChange={ () => onSelect( row.value ) }
											/>
											{ row.name }
											{ isCurrent && (
												<Badge
													intent="stable"
													className="dashboard-marketplace-hosting__current-badge"
												>
													{ __( 'Current plan' ) }
												</Badge>
											) }
										</label>
									</td>
									{ showInstalls && <td>{ row.installs }</td> }
									{ showInstalls && showMoreColumns && <td>{ row.installs }</td> }
									<td>{ row.visits }</td>
									<td>{ row.storage }</td>
									{ showMoreColumns && <td>{ row.workers }</td> }
								</tr>
							);
						} ) }
					</tbody>
				</table>
			</div>
			<Text>
				{ isPremium
					? __(
							'Every Premium plan is one site on dedicated resources, with 512MB for each PHP worker, geo-redundant HA cloud, enterprise-level caching, and hourly and daily backups.'
						)
					: sprintf(
							/* translators: %1$s is the charge per GB of storage, %2$s the charge per %3$s visits. */
							__(
								'Every plan shares its limits across all your sites, with unmetered bandwidth. Over your limits, it’s %1$s per GB of storage and %2$s per %3$s visits.'
							),
							formatCurrency( 0.5, 'USD' ),
							formatCurrency( 8, 'USD' ),
							formatNumberCompact( 10000 )
						) }
			</Text>
		</VStack>
	);
}
