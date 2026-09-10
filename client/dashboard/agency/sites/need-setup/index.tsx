import { activeAgencyQuery, pendingAgencySitesQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __, _n } from '@wordpress/i18n';
import { Icon, wordpress } from '@wordpress/icons';
import { useMemo, useState } from 'react';
import { DataViews, DataViewsCard } from '../../../components/dataviews';
import EmptyState from '../../../components/empty-state';
import { IconListItem } from '../../../components/icon-list/icon-list-item';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { hasWpcomLicenseWithoutSite } from './lib';
import SiteConfigurationModal from './site-configuration-modal';
import type { PendingAgencySite, ReferralApiResponse } from '@automattic/api-core';
import type { Field, ViewTable } from '@wordpress/dataviews';
import type { ReactNode } from 'react';

import './style.scss';

type SetupRow = {
	id: string;
	/** The pending site the row's button acts on. */
	siteId: number;
	description: ReactNode;
};

// Only the table itself is rendered: a fixed, single-column list has nothing to
// search, filter, sort, paginate or reconfigure.
const VIEW: ViewTable = {
	type: 'table',
	fields: [ 'site' ],
	layout: { enableMoving: false },
};

function getFields( onCreateSite: ( siteId: number ) => void ): Field< SetupRow >[] {
	return [
		{
			id: 'site',
			label: __( 'Site' ),
			enableHiding: false,
			enableSorting: false,
			filterBy: false,
			getValue: () => __( 'WordPress.com' ),
			render: ( { item } ) => (
				<IconListItem
					title={ __( 'WordPress.com' ) }
					description={ item.description }
					decoration={ <Icon icon={ wordpress } size={ 24 } /> }
					suffix={
						<Button
							variant="secondary"
							size="compact"
							onClick={ () => onCreateSite( item.siteId ) }
							__next40pxDefaultSize
						>
							{ __( 'Create new site' ) }
						</Button>
					}
				/>
			),
		},
	];
}

function getReferralDescription( referral: ReferralApiResponse ): ReactNode {
	return createInterpolateElement( __( '<email /> owns this' ), {
		email: <strong>{ referral.client.email }</strong>,
	} );
}

/**
 * Referred licenses are listed one by one so each shows its owner, while the
 * agency's own licenses collapse into a single row: they are interchangeable,
 * so setting one up is the same as setting up any other.
 */
function getSetupRows( pendingSites: PendingAgencySite[] ): SetupRow[] {
	const available = pendingSites.filter( hasWpcomLicenseWithoutSite );

	const rows: SetupRow[] = available.flatMap( ( { id, features } ) => {
		const { referral } = features.wpcom_atomic;
		return referral
			? [ { id: `referral-${ id }`, siteId: id, description: getReferralDescription( referral ) } ]
			: [];
	} );

	const unreferred = available.filter( ( { features } ) => ! features.wpcom_atomic.referral );
	const unreferredCount = unreferred.length;
	if ( unreferredCount ) {
		rows.push( {
			id: 'available',
			// The licenses are interchangeable, so the row sets up whichever comes first.
			siteId: unreferred[ 0 ].id,
			description: sprintf(
				/* translators: %d is the number of licenses available to set up. */
				_n( '%d site available', '%d sites available', unreferredCount ),
				unreferredCount
			),
		} );
	}

	return rows;
}

function NothingToSetUp() {
	return (
		<EmptyState.Wrapper isCompact>
			<EmptyState>
				<EmptyState.Header>
					<EmptyState.Title>{ __( 'Nothing to set up' ) }</EmptyState.Title>
					<EmptyState.Description>
						{ __( 'Every site you have purchased has been created.' ) }
					</EmptyState.Description>
				</EmptyState.Header>
			</EmptyState>
		</EmptyState.Wrapper>
	);
}

function PendingSitesList( { agencyId }: { agencyId: number } ) {
	const { data: pendingSites } = useSuspenseQuery( pendingAgencySitesQuery( agencyId ) );
	const [ configuringSiteId, setConfiguringSiteId ] = useState< number | null >( null );
	const fields = useMemo( () => getFields( setConfiguringSiteId ), [] );
	const rows = getSetupRows( pendingSites );

	// The route guard redirects when nothing is pending, so this is reached only
	// when the last license is set up while the screen is open.
	if ( ! rows.length ) {
		return <NothingToSetUp />;
	}

	return (
		<>
			<DataViewsCard className="agency-need-setup-table">
				<DataViews< SetupRow >
					data={ rows }
					fields={ fields }
					view={ VIEW }
					onChangeView={ () => {} }
					getItemId={ ( item ) => item.id }
					defaultLayouts={ { table: {} } }
					paginationInfo={ { totalItems: rows.length, totalPages: 1 } }
				>
					<DataViews.Layout />
				</DataViews>
			</DataViewsCard>
			{ configuringSiteId !== null && (
				<SiteConfigurationModal
					agencyId={ agencyId }
					pendingSiteId={ configuringSiteId }
					onRequestClose={ () => setConfiguringSiteId( null ) }
				/>
			) }
		</>
	);
}

export default function AgencySitesNeedSetup() {
	const { data: agency } = useSuspenseQuery( activeAgencyQuery() );

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Needs setup' ) }
					description={ __( 'Set up the sites you have purchased but not yet configured.' ) }
				/>
			}
		>
			{ agency ? <PendingSitesList agencyId={ agency.id } /> : <NothingToSetUp /> }
		</PageLayout>
	);
}
