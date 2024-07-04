import { WordPressLogo, JetpackLogo, Gridicon } from '@automattic/components';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { CheckboxControl } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useMemo, useCallback } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import type { Site } from 'calypso/a8c-for-agencies/sections/sites/types';

type SiteItem = {
	id: number;
	site: string;
	date: string;
	type: string;
};

const TypeIcon = ( { siteId }: { siteId: number } ) => {
	const isWPCOM = useSelector( ( state ) => getIsSiteWPCOM( state, siteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	if ( isWPCOM ) {
		return <Icon className="wpcom-sites-table__icon" icon={ <WordPressLogo /> } />;
	}
	if ( isJetpack ) {
		return <Icon className="wpcom-sites-table__icon" icon={ <JetpackLogo /> } />;
	}
	return <Gridicon icon="minus" />;
};

export default function WPCOMSitesTable( {
	selectedSites,
	setSelectedSites,
}: {
	selectedSites: number[];
	setSelectedSites: ( sites: number[] ) => void;
} ) {
	const translate = useTranslate();
	const agencyId = useSelector( getActiveAgencyId );

	const { data, isFetching } = useFetchDashboardSites( {
		isPartnerOAuthTokenLoaded: false,
		searchQuery: '',
		currentPage: 1,
		sort: {
			field: '',
			direction: '',
		},
		perPage: 100,
		agencyId,
		filter: {
			issueTypes: [],
			showOnlyFavorites: false,
		},
	} );

	const sites = useSelector( getSites );

	const isDesktop = useDesktopBreakpoint();

	const [ dataViewsState, setDataViewsState ] = useState( initialDataViewsState );

	// FIXME: This is a temporary solution to filter out sites that are already connected
	const items = useMemo( () => {
		return sites
			.filter(
				( site ) =>
					site?.visible &&
					! site.is_private &&
					data?.sites.every( ( s: Site ) => s.blog_id !== site.ID )
			)
			.map( ( site ) =>
				site
					? {
							id: site.ID,
							site: urlToSlug( site.URL ),
							date: site.options?.created_at || '',
					  }
					: undefined
			)
			.filter( Boolean ) as SiteItem[];
	}, [ data?.sites, sites ] );

	const onSelectAllSites = useCallback( () => {
		setSelectedSites(
			selectedSites.length === items.length ? [] : items.map( ( item ) => item.id )
		);
	}, [ items, selectedSites.length, setSelectedSites ] );

	const onSelectSite = useCallback(
		( checked: boolean, item: SiteItem ) => {
			if ( checked ) {
				setSelectedSites( [ ...selectedSites, item.id ] );
			} else {
				setSelectedSites( selectedSites.filter( ( id ) => id !== item.id ) );
			}
		},
		[ selectedSites, setSelectedSites ]
	);

	const fields = useMemo(
		() => [
			{
				id: 'site',
				header: (
					<div>
						<CheckboxControl
							label={ translate( 'Site' ).toUpperCase() }
							checked={ selectedSites.length === items.length }
							onChange={ onSelectAllSites }
							disabled={ false }
						/>
					</div>
				),
				getValue: () => '-' as string,
				render: ( { item }: { item: SiteItem } ) => (
					<CheckboxControl
						label={ item.site }
						checked={ selectedSites.includes( item.id ) }
						onChange={ ( checked ) => onSelectSite( checked, item ) }
						disabled={ false }
					/>
				),
				width: '100%',
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'date',
				header: translate( 'Date' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: SiteItem } ) => new Date( item.date ).toLocaleDateString(),
				width: '100%',
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'type',
				header: translate( 'Type' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: SiteItem } ) => <TypeIcon siteId={ item.id } />,
				width: '100%',
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ items.length, onSelectAllSites, onSelectSite, selectedSites, translate ]
	);

	return isDesktop ? (
		<div className="wpcom-sites-table redesigned-a8c-table">
			{ isFetching ? (
				<>
					<TextPlaceholder />
					<TextPlaceholder />
					<TextPlaceholder />
					<TextPlaceholder />
					<TextPlaceholder />
					<TextPlaceholder />
					<TextPlaceholder />
					<TextPlaceholder />
				</>
			) : (
				<ItemsDataViews
					data={ {
						items,
						fields,
						getItemId: ( item ) => `${ item.id }`,
						pagination: {
							totalItems: 1,
							totalPages: 1,
						},
						enableSearch: false,
						actions: [],
						dataViewsState: dataViewsState,
						setDataViewsState: setDataViewsState,
					} }
				/>
			) }
		</div>
	) : null;
}
