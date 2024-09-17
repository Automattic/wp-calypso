import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useMemo } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { useSiteSettings } from 'calypso/blocks/plugins-scheduled-updates/hooks/use-site-settings';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

interface SitePage {
	id: number;
	link: string;
	title: { rendered: string };
	wpcom_performance_report_url: string;
	wpcom_performance_url?: {
		url: string;
		hash: string;
	};
}

const getPages = ( siteId: number, query = '' ) => {
	return wpcomRequest< SitePage[] >( {
		path: addQueryArgs( `/sites/${ siteId }/pages`, {
			per_page: 10,
			search: query,
			page: 1,
			status: 'publish',
			_fields: [ 'id', 'link', 'title', 'wpcom_performance_report_url' ],
		} ),
		method: 'GET',
		apiNamespace: 'wp/v2',
	} );
};

export const getSitePagesQueryKey = ( {
	siteId,
	query,
}: {
	siteId?: number | null;
	query: string;
} ) => [ 'useSitePages', siteId, query ];

export const useSitePages = ( { query = '' } ) => {
	const { __ } = useI18n();

	const site = useSelector( getSelectedSite );
	const siteId = site?.ID;

	const { data } = useQuery( {
		queryKey: getSitePagesQueryKey( { siteId, query } ),
		queryFn: () => getPages( siteId!, query ),
		refetchOnWindowFocus: false,
		enabled: !! siteId,
		placeholderData: keepPreviousData,
		select: ( data ) => {
			return data.map( ( page ) => {
				let path = page.link.replace( site?.URL ?? '', '' );
				path = path.length > 1 ? path.replace( /\/$/, '' ) : path;
				const [ url, hash ] = page.wpcom_performance_report_url?.split( '&hash=' ) ?? [];

				return {
					url: page.link,
					path,
					label: page.title.rendered,
					value: page.id.toString(),
					wpcom_performance_url: { url, hash },
				};
			} );
		},
		meta: {
			persist: false,
		},
	} );

	const { getSiteSetting } = useSiteSettings( site?.slug );
	const homePagePerformanceUrl: SitePage[ 'wpcom_performance_report_url' ] =
		getSiteSetting( 'wpcom_performance_report_url' ) || undefined;

	const [ url, hash ] = homePagePerformanceUrl?.split( '&hash=' ) ?? [];

	const pages = useMemo( () => {
		if ( ! query ) {
			return [
				{
					url: site?.URL,
					path: '/',
					label: __( 'Home' ),
					value: '0',
					wpcom_performance_url: { url, hash },
				},
				...( data ?? [] ),
			];
		}

		return data ?? [];
	}, [ query, data, site?.URL, __, url, hash ] );

	return pages;
};
