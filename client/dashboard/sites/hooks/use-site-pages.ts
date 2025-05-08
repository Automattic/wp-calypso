import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useMemo } from 'react';
import wpcomRequest from 'wpcom-proxy-request';

const FIELDS_TO_RETRIEVE = [ 'id', 'link', 'title', 'wpcom_performance_report_url' ];

interface PerformanceReportUrl {
	url: string;
	hash: string;
}

interface SitePage {
	id: string;
	link: string;
	title: { rendered: string };
	wpcom_performance_report_url: string;
}

export interface PageReport {
	url: string;
	path: string;
	label: string;
	value: string;
	wpcom_performance_report_url: {
		url: string;
		hash: string;
	};
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

const getPages = ( siteId: string, query = '' ) => {
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

const mapPageToPageReport = ( page: SitePage, siteUrl: string | undefined ): PageReport => {
	let path = page.link.replace( siteUrl ?? '', '' );
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
};

export function useSitePages( {
	siteId,
	siteUrl,
	homepageHash,
	defaultHomepageID,
	query,
}: {
	siteId: string;
	siteUrl: string;
	homepageHash: string;
	defaultHomepageID: string;
	query?: string;
} ) {
	const { data, isLoading, isError, refetch } = useQuery( {
		queryKey: [ 'useSitePerformancePageReports', siteId, query ],
		queryFn: () => getPages( siteId!, query ),
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
		select: ( data ) => data.map( ( page ) => mapPageToPageReport( page, siteUrl ) ),
		meta: {
			persist: false,
		},
		enabled: !! homepageHash,
	} );

	const pages = useMemo( () => {
		if ( ! siteUrl ) {
			return [];
		}

		if ( ! query ) {
			return [
				{
					url: siteUrl,
					path: '/',
					label: __( 'Home' ),
					value: defaultHomepageID,
					wpcom_performance_report_url: {
						url: siteUrl,
						hash: homepageHash,
					},
				},
				...( data ?? [] ),
			];
		}

		return data ?? [];
	}, [ query, data, siteUrl, homepageHash ] );

	return { pages, refetch, isLoading, isError };
}
