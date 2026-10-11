/**
 * PROTOTYPE — proof of concept only.
 *
 * `/leads`: the client lead dashboard for agencies getting leads (Pro tier and
 * up). Totals for closed won, closed lost, and in progress, then every lead in
 * a table like the Referrals and WooPayments dashboards. Each lead's actions
 * menu opens a modal to update its status, actual value, and time to close.
 * Uses sample data (see `lead-data.ts`).
 */
import { formatCurrency } from '@automattic/number-formatters';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataViews as WPDataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { useMemo, useState } from 'react';
import { useLocale } from '../../app/locale';
import { DataViews, DataViewsCard, DataViewsEmptyStateLayout } from '../../components/dataviews';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import { formatDate } from '../../utils/datetime';
import EditLeadModal from './edit-lead-modal';
import { getLeadSourceLabels, getLeadStatusLabels, useLeads } from './lead-data';
import LeadStats from './lead-stats';
import './style.scss';
import type { Lead, LeadSource, LeadStatus } from './lead-data';
import type { Action, Field, View } from '@wordpress/dataviews';

const money = ( value: number ) => formatCurrency( value, 'USD', { stripZeros: true } );

const STATUS_INTENTS: Record< LeadStatus, 'informational' | 'medium' | 'stable' | 'draft' > = {
	new: 'informational',
	'in-progress': 'medium',
	won: 'stable',
	lost: 'draft',
};

const DEFAULT_VIEW: View = {
	type: 'table',
	page: 1,
	perPage: 25,
	search: '',
	filters: [],
	// No default sort: leads show in their list order (biggest open deal first, closed lost last).
	// `client` is the title column, so it isn't listed in `fields` too.
	titleField: 'client',
	descriptionField: 'project',
	fields: [ 'status', 'actualValue', 'reportedValue', 'source', 'receivedAt', 'daysToClose' ],
	// Spreads the columns evenly instead of leaving a wide gap after the client.
	layout: {
		styles: {
			client: { width: '28%' },
			status: { width: '9%' },
			actualValue: { width: '10%' },
			reportedValue: { width: '10%' },
			source: { width: '21%' },
			receivedAt: { width: '10%' },
			daysToClose: { width: '10%' },
		},
	},
};

function useLeadFields( locale: string ): Field< Lead >[] {
	return useMemo( () => {
		const statusLabels = getLeadStatusLabels();
		const sourceLabels = getLeadSourceLabels();
		return [
			{
				id: 'client',
				label: __( 'Client' ),
				enableGlobalSearch: true,
				enableHiding: false,
				getValue: ( { item } ) => item.client,
			},
			{
				id: 'project',
				label: __( 'Project' ),
				enableGlobalSearch: true,
				enableSorting: false,
				filterBy: false,
				getValue: ( { item } ) => item.project,
			},
			{
				id: 'actualValue',
				label: __( 'Actual value' ),
				type: 'integer',
				filterBy: false,
				// Only won leads have an actual value; the rest show the empty dash.
				getValue: ( { item } ) => ( item.status === 'won' ? item.actualValue : undefined ),
				render: ( { item } ) =>
					item.status === 'won' && item.actualValue !== undefined ? (
						<>{ money( item.actualValue ) }</>
					) : (
						<Text variant="muted">–</Text>
					),
			},
			{
				id: 'reportedValue',
				label: __( 'Reported value' ),
				type: 'integer',
				filterBy: false,
				getValue: ( { item } ) => item.reportedValue,
				render: ( { item } ) => <>{ money( item.reportedValue ) }</>,
			},
			{
				id: 'status',
				label: __( 'Status' ),
				type: 'text',
				elements: ( Object.keys( statusLabels ) as LeadStatus[] ).map( ( value ) => ( {
					value,
					label: statusLabels[ value ],
				} ) ),
				filterBy: { operators: [ 'isAny' ] },
				enableSorting: false,
				getValue: ( { item } ) => item.status,
				render: ( { item } ) => (
					<Badge intent={ STATUS_INTENTS[ item.status ] }>{ statusLabels[ item.status ] }</Badge>
				),
			},
			{
				id: 'source',
				label: __( 'Source' ),
				type: 'text',
				elements: ( Object.keys( sourceLabels ) as LeadSource[] ).map( ( value ) => ( {
					value,
					label: sourceLabels[ value ],
				} ) ),
				filterBy: { operators: [ 'is' ] },
				enableSorting: false,
				getValue: ( { item } ) => item.source,
				render: ( { item } ) => (
					<VStack spacing={ 0 }>
						<Text>{ sourceLabels[ item.source ] }</Text>
						<Text variant="muted" size={ 12 } lineHeight="16px">
							{ item.sourceDetail }
						</Text>
					</VStack>
				),
			},
			{
				id: 'receivedAt',
				label: __( 'Received' ),
				type: 'datetime',
				filterBy: false,
				getValue: ( { item } ) => item.receivedAt,
				render: ( { item } ) => <>{ formatDate( new Date( item.receivedAt ), locale ) }</>,
			},
			{
				id: 'daysToClose',
				label: __( 'Time to close' ),
				type: 'integer',
				filterBy: false,
				// Reported once a lead closes; open leads show the empty dash.
				getValue: ( { item } ) => item.daysToClose,
				render: ( { item } ) =>
					item.daysToClose !== undefined ? (
						<>
							{ sprintf(
								/* translators: %d is the number of days a lead took to close */
								_n( '%d day', '%d days', item.daysToClose ),
								item.daysToClose
							) }
						</>
					) : (
						<Text variant="muted">–</Text>
					),
			},
		];
	}, [ locale ] );
}

export default function AgencyLeads() {
	const locale = useLocale();
	const leads = useLeads();
	const fields = useLeadFields( locale );
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );
	const [ editingLeadId, setEditingLeadId ] = useState< string | null >( null );
	// Read the lead from the live list, so a save shows straight away.
	const editingLead = leads.find( ( lead ) => lead.id === editingLeadId );

	const actions: Action< Lead >[] = useMemo(
		() => [
			{
				id: 'edit-lead',
				label: __( 'Edit details' ),
				callback: ( items ) => setEditingLeadId( items[ 0 ].id ),
			},
		],
		[]
	);

	const { data, paginationInfo } = useMemo(
		() => filterSortAndPaginate( leads, view, fields ),
		[ leads, view, fields ]
	);

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Leads' ) }
					description={ __(
						'Clients who found you in the partner directories, and qualified leads from Automattic. Keep each lead up to date so we can send you more like it.'
					) }
				/>
			}
		>
			<VStack spacing={ 6 }>
				<LeadStats leads={ leads } />
				<DataViewsCard className="a4a-leads-table">
					<DataViews< Lead >
						data={ data }
						fields={ fields }
						view={ view }
						onChangeView={ setView }
						actions={ actions }
						searchLabel={ __( 'Search by client or project' ) }
						paginationInfo={ paginationInfo }
						getItemId={ ( item ) => item.id }
						defaultLayouts={ { table: { titleField: 'client', descriptionField: 'project' } } }
						empty={
							<DataViewsEmptyStateLayout
								title={ __( 'No leads yet' ) }
								description={ __(
									'Leads from the partner directories and Automattic will appear here.'
								) }
								isBorderless
							/>
						}
					>
						<HStack className="dataviews__view-actions" justify="space-between" alignment="center">
							<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
								<WPDataViews.Search />
								<WPDataViews.FiltersToggle />
							</HStack>
							<WPDataViews.ViewConfig />
						</HStack>
						<WPDataViews.FiltersToggled />
						<WPDataViews.Layout />
						<WPDataViews.Footer />
					</DataViews>
				</DataViewsCard>
			</VStack>
			{ editingLead && (
				<EditLeadModal lead={ editingLead } onClose={ () => setEditingLeadId( null ) } />
			) }
		</PageLayout>
	);
}
