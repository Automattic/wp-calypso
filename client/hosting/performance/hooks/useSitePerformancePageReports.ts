import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useCallback, useMemo } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { useDispatch } from 'calypso/state';
import { saveSiteSettings } from 'calypso/state/site-settings/actions';
import { isValidURL } from '../utils';
import type { SiteDetails } from '@automattic/data-stores';

interface SitePage {
	id: number;
	link: string;
	title: { rendered: string };
	wpcom_performance_report_url: string;
}

const FIELDS_TO_RETRIEVE = [ 'id', 'link', 'title', 'wpcom_performance_report_url' ];

const getPages = ( siteId: number, query = '' ) => {
	return wpcomRequest< SitePage[] >( {
		path: addQueryArgs( `/sites/${ siteId }/pages`, {
			per_page: 20,
			search: query,
			page: 1,
			status: 'publish',
			_fields: FIELDS_TO_RETRIEVE,
		} ),
		method: 'GET',
		apiNamespace: 'wp/v2',
	} );
};

const savePageMeta = ( siteId: number, pageId: number, url: string ) => {
	return wpcomRequest< SitePage >( {
		path: addQueryArgs( `/sites/${ siteId }/pages/${ pageId }`, {
			_fields: FIELDS_TO_RETRIEVE,
		} ),
		method: 'POST',
		apiNamespace: 'wp/v2',
		body: {
			wpcom_performance_report_url: url,
		},
	} );
};

interface PerformanceReportUrl {
	url: string;
	hash: string;
}

const toPerformanceReportParts = (
	pageUrl: string,
	performanceReportUrl: string
): PerformanceReportUrl => {
	const [ url, hash ] = performanceReportUrl.split( '&hash=' );

	if ( ! url || ! hash ) {
		return { url: pageUrl, hash: '' };
	}

	return {
		url,
		hash,
	};
};

const toPerformanceReportUrl = ( { url, hash }: PerformanceReportUrl ) => {
	return `${ url }&hash=${ hash }`;
};

const HOME_PAGE_ID = '0';

export const useSitePerformancePageReports = ( {
	query = '',
	site,
	reportUrl,
}: {
	query?: string;
	site: SiteDetails | undefined | null;
	reportUrl: string;
} ) => {
	const { __ } = useI18n();

	const siteId = site?.ID;

	const {
		data,
		isLoading: isInitialLoading,
		refetch,
	} = useQuery( {
		queryKey: [ 'useSitePerformancePageReports', siteId, query ],
		queryFn: () => getPages( siteId!, query ),
		refetchOnWindowFocus: false,
		enabled: !! siteId,
		placeholderData: keepPreviousData,
		select: ( data ) => {
			return data.map( ( page ) => {
				let path = page.link.replace( site?.URL ?? '', '' );
				path = path.length > 1 ? path.replace( /\/$/, '' ) : path;

				return {
					url: page.link,
					path,
					label: page.title.rendered || __( 'No Title' ),
					value: page.id.toString(),
					wpcom_performance_report_url: toPerformanceReportParts(
						page.link,
						page.wpcom_performance_report_url
					),
				};
			} );
		},
		meta: {
			persist: false,
		},
	} );

	const homePagePerformanceUrl: SitePage[ 'wpcom_performance_report_url' ] = reportUrl;

	const pages = useMemo( () => {
		if ( ! site?.URL || ! homePagePerformanceUrl ) {
			return [];
		}

		if ( ! query ) {
			return [
				{
					url: site?.URL,
					path: '/',
					label: __( 'Home' ),
					value: HOME_PAGE_ID,
					wpcom_performance_report_url: toPerformanceReportParts(
						site.URL,
						homePagePerformanceUrl
					),
				},
				...( data ?? [] ),
			];
		}

		return data ?? [];
	}, [ query, data, site?.URL, __, homePagePerformanceUrl ] );

	return { pages, isInitialLoading, refetch };
};

export function useSavePerformanceReportUrl( siteId: number ) {
	const dispatch = useDispatch();

	return useCallback(
		async ( pageId: string, performanceReport: PerformanceReportUrl ) => {
			if ( ! siteId ) {
				return;
			}

			const performanceReportUrl = toPerformanceReportUrl( performanceReport );

			if ( ! isValidURL( performanceReportUrl ) ) {
				return;
			}

			if ( pageId === HOME_PAGE_ID ) {
				return await dispatch(
					saveSiteSettings( siteId, { wpcom_performance_report_url: performanceReportUrl } )
				);
			}
			return await savePageMeta( siteId, parseInt( pageId, 10 ), performanceReportUrl );
		},
		[ siteId, dispatch ]
	);
}
