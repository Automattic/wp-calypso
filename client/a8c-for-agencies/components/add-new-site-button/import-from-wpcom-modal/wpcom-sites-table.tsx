import { WordPressLogo, JetpackLogo, Gridicon } from '@automattic/components';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { CheckboxControl } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useCallback } from 'react';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isA4AClientSite from 'calypso/state/sites/selectors/is-a4a-client-site';
import A4ALogo from '../../a4a-logo';
import useManagedSitesMap from './hooks/use-managed-sites-map';
import WPCOMSitesTableContent from './table-content';
import WPCOMSitesTablePlaceholder from './table-placeholder';

export type SiteItem = {
	id: number;
	site: string;
	date: string;
	type: string;
};

const TypeIcon = ( { siteId }: { siteId: number } ) => {
	const isWPCOM = useSelector( ( state ) => getIsSiteWPCOM( state, siteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isA4AClient = useSelector( ( state ) => isA4AClientSite( state, siteId ) );

	if ( isWPCOM ) {
		return <Icon className="wpcom-sites-table__icon" icon={ <WordPressLogo /> } />;
	}
	if ( isA4AClient ) {
		return <Icon className="wpcom-sites-table__icon" icon={ <A4ALogo /> } />;
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

	const { data } = useFetchDashboardSites( {
		isPartnerOAuthTokenLoaded: false,
		searchQuery: '',
		currentPage: 1,
		perPage: 1,
		agencyId,
		filter: {
			issueTypes: [],
			showOnlyFavorites: false,
			showOnlyDevelopmentSites: false,
		},
	} );

	const { map: managedSitesMap, isPending } = useManagedSitesMap( { size: data?.total } );

	const sites = useSelector( getSites );

	const isDesktop = useDesktopBreakpoint();

	// FIXME: This is a temporary solution to filter out sites that are already connected
	// Maybe we should finalize on the list if sites to be displayed
	const items = useMemo( () => {
		return sites
			.filter(
				( site ) =>
					site &&
					! site.is_wpcom_staging_site &&
					( site.is_wpcom_atomic || site.jetpack || site.is_a4a_client ) &&
					! managedSitesMap?.[ site.ID as number ]
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
	}, [ managedSitesMap, sites ] );

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
		() =>
			! isDesktop
				? [
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
								<div className="wpcom-sites-table__site-mobile">
									<CheckboxControl
										className="view-details-button"
										data-site-id={ item.id }
										// We don't want to show the label here since we show the logo and site name separately
										label={ undefined }
										checked={ selectedSites.includes( item.id ) }
										onChange={ ( checked ) => onSelectSite( checked, item ) }
										disabled={ false }
									/>
									<TypeIcon siteId={ item.id } />
									<span>{ item.site }</span>
								</div>
							),
							width: '100%',
							enableHiding: false,
							enableSorting: false,
						},
				  ]
				: [
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
									className="view-details-button"
									data-site-id={ item.id }
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
							render: ( { item }: { item: SiteItem } ) =>
								new Date( item.date ).toLocaleDateString(),
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
		[ isDesktop, items.length, onSelectAllSites, onSelectSite, selectedSites, translate ]
	);

	return (
		<div className="wpcom-sites-table redesigned-a8c-table">
			{ isPending ? (
				<WPCOMSitesTablePlaceholder />
			) : (
				<WPCOMSitesTableContent items={ items } fields={ fields } />
			) }
		</div>
	);
}
