import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import wpcomRequest from 'wpcom-proxy-request';
import { SiteDetails } from '../site';

type ResultType = 'WPCOM' | 'WPORG' | 'UNKNOWN' | 'NOT_OWNED_BY_USER' | 'UNKNOWN';

export type AnalysisReport = {
	result: ResultType;
	site?: SiteDetails;
};

type Analysis = {
	url: string;
	platform: string;
	meta: {
		title: string;
		favicon: string;
	};
	platform_data?: { is_wpcom: boolean };
};

// a simple way to check if a string is host to save on API calls
function isHost( string: string | undefined ) {
	if ( string ) {
		return string.length > 4 && Boolean( string?.match( /\w{2,}\.\w{2,16}/ ) );
	}
	return false;
}

/**
 * Analyses a site to determine whether its a WPCOM site, and if yes, it would fetch and return the site information (SiteDetails).
 *
 * @param siteURL the site URL
 */
export function useSiteAnalysis( siteURL: string | undefined ) {
	const [ analysis, setAnalysis ] = useState< AnalysisReport | undefined >();
	const [ debouncedSiteUrl ] = useDebounce( siteURL, 500 );

	useEffect( () => {
		setAnalysis( undefined );
		if ( ! isHost( debouncedSiteUrl ) ) {
			return;
		}
		if ( debouncedSiteUrl ) {
			( async () => {
				try {
					const analysis = await wpcomRequest< Analysis >( {
						path: `/imports/analyze-url?site_url=${ encodeURIComponent( debouncedSiteUrl ) }`,
						apiNamespace: 'wpcom/v2',
					} );

					if ( analysis.platform_data?.is_wpcom ) {
						try {
							// if a wpcom site, get its info
							const site = await wpcomRequest< SiteDetails >( {
								path: '/sites/' + encodeURIComponent( debouncedSiteUrl ),
								apiVersion: '1.1',
							} );
							setAnalysis( { site, result: 'WPCOM' } );
						} catch ( error ) {
							// wpcom site, but not owned by user
							setAnalysis( { result: 'NOT_OWNED_BY_USER' } );
						}
					} else if ( analysis.platform === 'wordpress' ) {
						setAnalysis( { result: 'WPORG' } );
					} else {
						setAnalysis( { result: 'UNKNOWN' } );
					}
				} catch ( error ) {
					setAnalysis( { result: 'UNKNOWN' } );
				}
			} )();
		}
	}, [ debouncedSiteUrl ] );

	return { ...analysis, isLoading: ! analysis };
}
