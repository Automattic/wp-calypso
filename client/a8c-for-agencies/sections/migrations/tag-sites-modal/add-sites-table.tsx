import { useDesktopBreakpoint } from '@automattic/viewport-react';
import {
	BaseControl,
	CheckboxControl,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import {
	useFetchAllManagedSitesForCommission,
	type SiteItem,
} from 'calypso/dashboard/agency/earn/migrations/hooks/use-fetch-all-managed-sites-for-commission';
import type { Field, View } from '@wordpress/dataviews';
import type { RecordTracksEvent, TaggedSite } from 'calypso/dashboard/agency/earn/migrations/types';

import '../commissions/components/dataviews/style.scss';

export default function MigrationsAddSitesTable( {
	selectedSites,
	setSelectedSites,
	taggedSites,
	migrationSourceHost,
	recordTracksEvent,
	getSiteCreatedAt,
}: {
	selectedSites: SiteItem[];
	setSelectedSites: ( sites: SiteItem[] ) => void;
	taggedSites?: TaggedSite[];
	migrationSourceHost: string;
	recordTracksEvent: RecordTracksEvent;
	getSiteCreatedAt: ( blogId: number ) => string | undefined;
} ) {
	const isDesktop = useDesktopBreakpoint();

	const { items, isLoading } = useFetchAllManagedSitesForCommission();

	const taggedSitesIds = useMemo(
		() => taggedSites?.map( ( site ) => site.id ) || [],
		[ taggedSites ]
	);

	// Filter out sites that are already tagged or are dev / staging sites.
	const availableSites = useMemo( () => {
		return items
			.filter( ( item ) => ! taggedSitesIds.includes( item.id ) )
			.filter( ( item ) => item.rawSite.a4a_is_dev_site !== true )
			.filter( ( item ) => {
				try {
					const url = new URL( item.rawSite.url_with_scheme ?? '' );
					return ! [ 'mystagingwebsite.com', 'wpcomstaging.com' ].some( ( domain ) =>
						url.host.endsWith( domain )
					);
				} catch {
					return false;
				}
			} );
	}, [ items, taggedSitesIds ] );

	const [ view, setView ] = useState< View >( {
		type: 'table',
		search: '',
		filters: [],
		page: 1,
		perPage: 50,
		sort: { field: '', direction: 'asc' },
		fields: [ 'site', 'date' ],
		layout: {},
	} );

	const onSelectAllSites = useCallback( () => {
		const isAllSitesSelected = selectedSites.length === availableSites.length;
		setSelectedSites( isAllSitesSelected ? [] : availableSites );
		recordTracksEvent( 'calypso_a8c_migrations_tag_sites_modal_select_all_sites_click', {
			type: isAllSitesSelected ? 'deselect' : 'select',
		} );
	}, [ recordTracksEvent, availableSites, selectedSites.length, setSelectedSites ] );

	const onSelectSite = useCallback(
		( checked: boolean, item: SiteItem ) => {
			if ( checked ) {
				setSelectedSites( [ ...selectedSites, item ] );
			} else {
				setSelectedSites( selectedSites.filter( ( site ) => site.id !== item.id ) );
			}
			recordTracksEvent( 'calypso_a8c_migrations_tag_sites_modal_select_site_click', {
				type: checked ? 'select' : 'deselect',
			} );
		},
		[ recordTracksEvent, selectedSites, setSelectedSites ]
	);

	const fields: Field< SiteItem >[] = useMemo( () => {
		const siteColumn = {
			id: 'site',
			label: (
				<div>
					<CheckboxControl
						label={ __( 'Site' ) }
						checked={ selectedSites.length === availableSites.length }
						onChange={ onSelectAllSites }
						disabled={ false }
					/>
				</div>
			 ) as any,
			getValue: () => '-',
			render: ( { item }: { item: SiteItem } ) => (
				<CheckboxControl
					className="view-details-button"
					data-site-id={ item.id }
					label={ item.site }
					checked={ selectedSites.map( ( site ) => site.id ).includes( item.id ) }
					onChange={ ( checked ) => onSelectSite( checked, item ) }
					disabled={ false }
				/>
			),
			enableHiding: false,
			enableSorting: false,
		};

		const dateColumn = {
			id: 'date',
			label: __( 'Date added' ),
			getValue: () => '-',
			render: ( { item }: { item: SiteItem } ) => {
				const createdAt = getSiteCreatedAt( item.rawSite.blog_id );
				return createdAt ? new Date( createdAt ).toLocaleDateString() : '-';
			},
			enableHiding: false,
			enableSorting: false,
		};

		return isDesktop ? [ siteColumn, dateColumn ] : [ siteColumn ];
	}, [
		isDesktop,
		availableSites.length,
		onSelectAllSites,
		onSelectSite,
		selectedSites,
		getSiteCreatedAt,
	] );

	const { data: allSites, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( availableSites, view, fields );
	}, [ availableSites, view, fields ] );

	return (
		<div className="add-sites-table redesigned-a8c-table">
			<BaseControl
				label={ __( 'Select sites to tag' ) }
				className="migrations-tag-sites-modal__table-control"
			>
				{ migrationSourceHost && (
					<Spacer marginY={ 4 }>
						<div className="migrations-tag-sites-modal__instruction">
							{ sprintf(
								/* translators: %s: the hosting provider name */
								__( 'Make sure you only select sites previously hosted on %s' ),
								migrationSourceHost
							) }
						</div>
					</Spacer>
				) }
				<DataViews
					data={ allSites }
					view={ view }
					onChangeView={ setView }
					fields={ fields }
					search={ false }
					actions={ [] }
					getItemId={ ( item ) => `${ item.id }` }
					paginationInfo={ paginationInfo }
					defaultLayouts={ { table: {} } }
					isLoading={ isLoading }
				/>
			</BaseControl>
		</div>
	);
}
