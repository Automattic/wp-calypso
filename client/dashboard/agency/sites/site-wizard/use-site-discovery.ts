import {
	siteUrlAnalysisQuery,
	siteHostingDiscoveryQuery,
	siteDnsDiscoveryQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

export default function useSiteDiscovery( url: string, expanded: boolean ) {
	const container = useRef< HTMLDivElement >( null );
	const [ visible, setVisible ] = useState( typeof IntersectionObserver === 'undefined' );
	const domain = new URL( url ).hostname;
	const reserved =
		/(^|\.)(example|test|invalid|localhost|example\.com|example\.org|example\.net)$/.test( domain );
	useEffect( () => {
		if ( visible || ! container.current ) {
			return;
		}
		const observer = new IntersectionObserver(
			( entries ) => {
				if ( entries.some( ( entry ) => entry.isIntersecting ) ) {
					setVisible( true );
					observer.disconnect();
				}
			},
			{ rootMargin: '120px' }
		);
		observer.observe( container.current );
		return () => observer.disconnect();
	}, [ visible ] );
	const analysis = useQuery( {
		...siteUrlAnalysisQuery( url ),
		enabled: visible && ! reserved,
	} );
	const hosting = useQuery( {
		...siteHostingDiscoveryQuery( domain ),
		enabled: visible && ! reserved,
	} );
	const dns = useQuery( {
		...siteDnsDiscoveryQuery( domain ),
		enabled: visible && expanded && ! reserved,
	} );
	return { container, visible, reserved, analysis, hosting, dns };
}

/** The host a site appears to be on, or undefined while unknown or hidden behind a CDN. */
export function getDetectedHost( {
	analysis,
	hosting,
}: Pick< ReturnType< typeof useSiteDiscovery >, 'analysis' | 'hosting' > ) {
	const platform = analysis.data?.platform_data;
	if ( platform?.is_pressable ) {
		return 'Pressable';
	}
	if ( platform?.is_wpcom ) {
		return 'WordPress.com';
	}
	if ( platform?.is_wpengine ) {
		return 'WP Engine';
	}
	const provider = hosting.data?.hosting_provider;
	return provider && provider.slug !== 'unknown' && ! provider.is_cdn ? provider.name : undefined;
}
