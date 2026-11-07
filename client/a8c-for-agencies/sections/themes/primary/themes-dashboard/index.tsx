import { sprintf, _n, __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import {
	DATAVIEWS_LIST,
	DATAVIEWS_TABLE,
	initialDataViewsState,
} from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import QuerySites from 'calypso/components/data/query-sites';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import Layout from 'calypso/layout/hosting-dashboard';
import LayoutColumn from 'calypso/layout/hosting-dashboard/column';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderSubtitle as Subtitle,
} from 'calypso/layout/hosting-dashboard/header';
import LayoutTop from 'calypso/layout/hosting-dashboard/top';
import acceptDialog from 'calypso/lib/accept';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import getSelectedOrAllSitesWithJetpackPlugin from 'calypso/state/selectors/get-selected-or-all-sites-with-jetpack-plugin';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import useFetchAllSitesThemes from '../../hooks/use-fetch-all-sites-themes';
import useSetSiteThemesAutoupdate from '../../hooks/use-set-site-themes-autoupdate';
import useUpdateSiteThemes from '../../hooks/use-update-site-themes';
import ThemeSitesPane from './theme-sites-pane';
import ThemesList from './themes-list';
import type { AggregatedTheme, ThemeSiteInstance } from '../../types';

import 'calypso/my-sites/plugins/plugins-dashboard/style.scss';
import 'calypso/sites/components/dotcom-style.scss';
import './style.scss';

type UpdatePair = { themeId: string; siteId: number };

const pairKey = ( themeId: string, siteId: number ) => `${ themeId }|${ siteId }`;

export default function ThemesDashboard() {
	const dispatch = useDispatch();

	const sites = useSelector( getSelectedOrAllSitesWithJetpackPlugin );
	const sitesLoaded = useSelector( hasLoadedSites );

	const { themes, isLoading } = useFetchAllSitesThemes( sites );
	const { mutateAsync: updateSiteThemes } = useUpdateSiteThemes();
	const { mutateAsync: setSiteThemesAutoupdate } = useSetSiteThemesAutoupdate();

	const [ updatingKeys, setUpdatingKeys ] = useState< Set< string > >( new Set() );

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		perPage: 15,
		fields: [ 'sites', 'update' ],
		titleField: 'name',
		mediaField: 'icon',
		layout: {
			styles: {
				name: {
					width: '60%',
					minWidth: '300px',
				},
				sites: {
					width: '70px',
				},
				update: {
					minWidth: '200px',
				},
				actions: {
					width: '50px',
				},
			},
		},
	} );

	// Re-resolve the selected item so the pane reflects refetched data after updates.
	const selectedTheme = useMemo(
		() =>
			dataViewsState.selectedItem &&
			themes.find( ( theme ) => theme.id === dataViewsState.selectedItem?.id ),
		[ dataViewsState.selectedItem, themes ]
	);

	const openThemeSitesPane = useCallback(
		( theme: AggregatedTheme ) => {
			setDataViewsState( ( prevState ) => ( {
				...prevState,
				selectedItem: theme,
				type: DATAVIEWS_LIST,
			} ) );
			dispatch(
				recordTracksEvent( 'calypso_a4a_themes_list_theme_sitecount_click', {
					theme_slug: theme.id,
					site_count: theme.sites.length,
				} )
			);
		},
		[ dispatch ]
	);

	const closeThemeSitesPane = useCallback( () => {
		setDataViewsState( ( prevState ) => ( {
			...prevState,
			selectedItem: null,
			type: DATAVIEWS_TABLE,
		} ) );
	}, [] );

	const isThemeUpdating = useCallback(
		( themeId: string ) =>
			Array.from( updatingKeys ).some( ( key ) => key.startsWith( `${ themeId }|` ) ),
		[ updatingKeys ]
	);

	const isSiteUpdating = useCallback(
		( themeId: string, siteId: number ) => updatingKeys.has( pairKey( themeId, siteId ) ),
		[ updatingKeys ]
	);

	const performUpdates = useCallback(
		async ( pairs: UpdatePair[] ) => {
			if ( ! pairs.length ) {
				return;
			}

			setUpdatingKeys( ( previous ) => {
				const next = new Set( previous );
				pairs.forEach( ( pair ) => next.add( pairKey( pair.themeId, pair.siteId ) ) );
				return next;
			} );

			const themesBySite = new Map< number, string[] >();
			pairs.forEach( ( pair ) => {
				themesBySite.set( pair.siteId, [
					...( themesBySite.get( pair.siteId ) ?? [] ),
					pair.themeId,
				] );
			} );

			const results = await Promise.allSettled(
				Array.from( themesBySite.entries() ).map( ( [ siteId, themeSlugs ] ) =>
					updateSiteThemes( { siteId, themes: themeSlugs } ).finally( () => {
						setUpdatingKeys( ( previous ) => {
							const next = new Set( previous );
							themeSlugs.forEach( ( slug ) => next.delete( pairKey( slug, siteId ) ) );
							return next;
						} );
					} )
				)
			);

			const failures = results.filter( ( result ) => result.status === 'rejected' ).length;
			if ( failures ) {
				dispatch(
					errorNotice(
						sprintf(
							/* translators: %d is the number of sites where theme updates failed */
							_n(
								'Theme updates failed on %d site.',
								'Theme updates failed on %d sites.',
								failures
							),
							failures
						)
					)
				);
			} else {
				dispatch( successNotice( __( 'Themes updated.' ), { duration: 5000 } ) );
			}
		},
		[ dispatch, updateSiteThemes ]
	);

	const confirmUpdateThemes = useCallback(
		( items: AggregatedTheme[] ) => {
			const eligible = items.filter( ( item ) => item.pendingUpdates.length > 0 );
			if ( ! eligible.length ) {
				return;
			}

			dispatch(
				recordTracksEvent( 'calypso_a4a_themes_update_click', { theme_count: eligible.length } )
			);

			const pairs: UpdatePair[] = eligible.flatMap( ( item ) =>
				item.pendingUpdates.map( ( site ) => ( { themeId: item.id, siteId: site.siteId } ) )
			);
			const siteCount = new Set( pairs.map( ( pair ) => pair.siteId ) ).size;

			const message =
				eligible.length === 1
					? sprintf(
							/* translators: %1$s is a theme name, %2$d is a number of sites */
							_n(
								'You are about to update %1$s on %2$d site.',
								'You are about to update %1$s on %2$d sites.',
								siteCount
							),
							eligible[ 0 ].name,
							siteCount
					  )
					: sprintf(
							/* translators: %1$d is a number of themes, %2$d is a number of sites */
							_n(
								'You are about to update %1$d themes on %2$d site.',
								'You are about to update %1$d themes on %2$d sites.',
								siteCount
							),
							eligible.length,
							siteCount
					  );

			acceptDialog(
				<p>{ message }</p>,
				( accepted: boolean ) => {
					if ( accepted ) {
						performUpdates( pairs );
					}
				},
				__( 'Update' ),
				__( 'Cancel' ),
				{
					useModal: true,
					additionalClassNames: 'themes-dashboard__confirmation-modal',
					modalOptions: {
						title: __( 'Update themes' ),
					},
				}
			);
		},
		[ dispatch, performUpdates ]
	);

	const updateSingleSite = useCallback(
		( theme: AggregatedTheme, site: ThemeSiteInstance ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_themes_sites_pane_update_click', {
					theme_slug: theme.id,
					site_id: site.siteId,
				} )
			);
			performUpdates( [ { themeId: theme.id, siteId: site.siteId } ] );
		},
		[ dispatch, performUpdates ]
	);

	const confirmSetAutoupdates = useCallback(
		( items: AggregatedTheme[], autoupdate: boolean ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_themes_autoupdate_toggle_click', {
					theme_count: items.length,
					enabled: autoupdate,
				} )
			);

			const themesBySite = new Map< number, string[] >();
			items.forEach( ( item ) =>
				item.sites.forEach( ( site ) => {
					themesBySite.set( site.siteId, [
						...( themesBySite.get( site.siteId ) ?? [] ),
						item.id,
					] );
				} )
			);

			const message = autoupdate
				? sprintf(
						/* translators: %1$d is a number of themes, %2$d is a number of sites */
						_n(
							'This will enable auto-updates for %1$d theme on %2$d site.',
							'This will enable auto-updates for %1$d theme across %2$d sites.',
							themesBySite.size
						),
						items.length,
						themesBySite.size
				  )
				: sprintf(
						/* translators: %1$d is a number of themes, %2$d is a number of sites */
						_n(
							'This will disable auto-updates for %1$d theme on %2$d site.',
							'This will disable auto-updates for %1$d theme across %2$d sites.',
							themesBySite.size
						),
						items.length,
						themesBySite.size
				  );

			acceptDialog(
				<p>{ message }</p>,
				async ( accepted: boolean ) => {
					if ( ! accepted ) {
						return;
					}
					const results = await Promise.allSettled(
						Array.from( themesBySite.entries() ).map( ( [ siteId, themeSlugs ] ) =>
							setSiteThemesAutoupdate( { siteId, themes: themeSlugs, autoupdate } )
						)
					);
					const failures = results.filter( ( result ) => result.status === 'rejected' ).length;
					if ( failures ) {
						dispatch( errorNotice( __( 'Some auto-update settings could not be changed.' ) ) );
					} else {
						dispatch(
							successNotice(
								autoupdate ? __( 'Auto-updates enabled.' ) : __( 'Auto-updates disabled.' ),
								{ duration: 5000 }
							)
						);
					}
				},
				autoupdate ? __( 'Enable' ) : __( 'Disable' ),
				__( 'Cancel' ),
				{
					useModal: true,
					additionalClassNames: 'themes-dashboard__confirmation-modal',
					modalOptions: {
						title: autoupdate ? __( 'Enable auto-updates' ) : __( 'Disable auto-updates' ),
					},
				}
			);
		},
		[ dispatch, setSiteThemesAutoupdate ]
	);

	const showLoading = ! sitesLoaded || ( sites.length > 0 && isLoading );

	const updatedDataViewsState = useMemo(
		() => ( { ...dataViewsState, selectedItem: selectedTheme } ),
		[ dataViewsState, selectedTheme ]
	);

	const dashboardTitle = selectedTheme
		? sprintf(
				/* translators: %s is a theme name */
				__( 'Manage %s in all sites' ),
				selectedTheme.name
		  )
		: __( 'Manage themes' );

	return (
		<Layout
			className={ clsx(
				'sites-dashboard',
				'sites-dashboard__layout',
				! selectedTheme && 'preview-hidden'
			) }
			wide
			title={ dashboardTitle }
			sidebarNavigation={ <SidebarNavigation sectionTitle={ __( 'Manage themes' ) } /> }
		>
			<QuerySites allSites />
			<LayoutColumn className="sites-overview" wide>
				<LayoutTop withNavigation={ false }>
					<LayoutHeader>
						<Title>{ __( 'Manage themes' ) }</Title>
						{ ! selectedTheme && (
							<Subtitle>{ __( 'Manage all your themes in one place' ) }</Subtitle>
						) }
					</LayoutHeader>
				</LayoutTop>
				<ThemesList
					themes={ themes }
					isLoading={ showLoading }
					dataViewsState={ updatedDataViewsState }
					setDataViewsState={ setDataViewsState }
					onUpdateThemes={ confirmUpdateThemes }
					onSetAutoupdates={ confirmSetAutoupdates }
					openThemeSitesPane={ openThemeSitesPane }
					isThemeUpdating={ isThemeUpdating }
				/>
			</LayoutColumn>
			{ selectedTheme && (
				<ThemeSitesPane
					theme={ selectedTheme }
					onClose={ closeThemeSitesPane }
					onUpdateSite={ updateSingleSite }
					isSiteUpdating={ isSiteUpdating }
				/>
			) }
		</Layout>
	);
}
