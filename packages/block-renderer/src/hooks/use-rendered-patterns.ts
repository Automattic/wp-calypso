import { useLocale } from '@automattic/i18n-utils';
import { useEffect, useState } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import type { RenderedPatterns, SiteInfo } from '../types';

const PAGE_SIZE = 20;

const fetchRenderedPatterns = (
	siteId: number | string,
	stylesheet: string,
	language = 'en',
	patternIds: string[],
	siteInfo: SiteInfo,
	page = 0
): Promise< RenderedPatterns > => {
	const pattern_ids = patternIds.slice( page * PAGE_SIZE, ( page + 1 ) * PAGE_SIZE ).join( ',' );
	const { title, tagline } = siteInfo;
	const params = new URLSearchParams( {
		stylesheet,
		language,
		pattern_ids,
	} );

	if ( title ) {
		params.set( 'site_title', title );
	}

	if ( tagline ) {
		params.set( 'site_tagline', tagline );
	}

	return wpcomRequest( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ encodeURIComponent( siteId ) }/block-renderer/patterns/render`,
		query: params.toString(),
	} );
};

const useRenderedPatterns = (
	siteId: number | string,
	stylesheet: string,
	patternIds: string[],
	siteInfo: SiteInfo = {}
) => {
	const locale = useLocale();
	const [ renderedPatterns, setRenderedPatterns ] = useState( {} );

	useEffect( () => {
		if ( ! patternIds.length ) {
			return;
		}

		// If we query too many patterns at once, the endpoint will be very slow.
		// Hence, do local pagination to ensure the performance.
		const totalPage = Math.ceil( patternIds.length / PAGE_SIZE );

		const promises = [];
		for ( let i = 0; i < totalPage; i++ ) {
			promises.push( fetchRenderedPatterns( siteId, stylesheet, locale, patternIds, siteInfo, i ) );
		}

		Promise.all( promises ).then( ( pages ) => {
			setRenderedPatterns(
				pages.reduce( ( previous, current ) => ( { ...previous, ...current } ), {} )
			);
		} );
	}, [ patternIds ] );

	return renderedPatterns;
};

export default useRenderedPatterns;
