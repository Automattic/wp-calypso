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
	wpcom_performance_url?: string;
}

const getPages = ( siteId: number, query = '' ) => {
	return wpcomRequest< SitePage[] >( {
		path: addQueryArgs( `/sites/${ siteId }/pages`, {
			per_page: 10,
			search: query,
			page: 1,
			status: 'publish',
			_fields: [ 'id', 'link', 'title', 'wpcom_performance_url' ],
		} ),
		method: 'GET',
		apiNamespace: 'wp/v2',
	} );
};

export const useSitePages = ( { query = '' } ) => {
	const { __ } = useI18n();

	const site = useSelector( getSelectedSite );
	const siteId = site?.ID;

	const { data } = useQuery( {
		queryKey: [ 'useSitePages', siteId, query ],
		queryFn: () => getPages( siteId!, query ),
		refetchOnWindowFocus: false,
		enabled: !! siteId,
		placeholderData: keepPreviousData,
		select: ( data ) => {
			return data.map( ( page ) => {
				let url = page.link.replace( site?.URL ?? '', '' );
				url = url.length > 1 ? url.replace( /\/$/, '' ) : url;

				return {
					url,
					label: page.title.rendered,
					value: page.id.toString(),
					wpcom_performance_url: page.wpcom_performance_url,
				};
			} );
		},
		meta: {
			persist: false,
		},
	} );

	const { getSiteSetting } = useSiteSettings( site?.slug );
	const homePagePerformanceUrl = getSiteSetting( 'wpcom_performance_url' );

	const pages = useMemo( () => {
		if ( ! query ) {
			return [
				{
					url: '/',
					label: __( 'Home' ),
					value: 'home',
					wpcom_performance_url: homePagePerformanceUrl || undefined,
				},
				...( data ?? [] ),
			];
		}

		return data ?? [];
	}, [ query, data, __, homePagePerformanceUrl ] );

	return pages;
};
