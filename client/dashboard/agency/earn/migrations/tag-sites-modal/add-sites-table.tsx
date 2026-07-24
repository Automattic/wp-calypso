import {
	BaseControl,
	CheckboxControl,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import { formatDate } from '../../../../utils/datetime';
import {
	useFetchAllManagedSitesForCommission,
	type SiteItem,
} from '../hooks/use-fetch-all-managed-sites-for-commission';
import type { RecordTracksEvent, TaggedSite } from '../types';
import type { Field, View } from '@wordpress/dataviews';

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
	const isDesktop = useViewportMatch( 'large' );

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
			// DataViews types `label` as a string, but it accepts a node at runtime;
			// this renders the select-all control in the column header.
			label: (
				<CheckboxControl
					label={ __( 'Site' ) }
					checked={ availableSites.length > 0 && selectedSites.length === availableSites.length }
					onChange={ onSelectAllSites }
					disabled={ false }
				/>
			 ) as unknown as string,
			getValue: () => '-',
			render: ( { item }: { item: SiteItem } ) => (
				<CheckboxControl
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
				// TODO: resolve the real locale once the dashboard port lands; hardcoded for now.
				return createdAt ? formatDate( new Date( createdAt ), 'en' ) : '-';
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
		<>
			<BaseControl label={ __( 'Select sites to tag' ) }>
				{ migrationSourceHost && (
					<Spacer marginY={ 4 }>
						<Text variant="muted">
							{ sprintf(
								/* translators: %s: the hosting provider name */
								__( 'Make sure you only select sites previously hosted on %s' ),
								migrationSourceHost
							) }
						</Text>
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
		</>
	);
}
