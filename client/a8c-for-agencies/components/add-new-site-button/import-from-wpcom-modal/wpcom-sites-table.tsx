import { WordPressLogo, JetpackLogo, Gridicon } from '@automattic/components';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { CheckboxControl } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useCallback } from 'react';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import WPCOMSitesTableContent from './table-content';
import type { Site } from 'calypso/a8c-for-agencies/sections/sites/types';

export type SiteItem = {
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

	// FIXME: This is a temporary solution to filter out sites that are already connected
	// Maybe we should finalize on the list if sites to be displayed
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
				<WPCOMSitesTableContent items={ items } fields={ fields } />
			) }
		</div>
	);
}
