import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useCallback, useRef } from '@wordpress/element';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';

type TracksProperties = Record< string, unknown >;

type SiteContext = {
	explicitSiteId?: unknown;
	siteId?: unknown;
	primarySiteId?: unknown;
	usePrimarySiteId?: boolean;
};

type Options = Pick< SiteContext, 'explicitSiteId' | 'usePrimarySiteId' >;

function getValidBlogId( value: unknown ): number | undefined {
	const blogId = Number( value );

	return Number.isInteger( blogId ) && blogId > 0 ? blogId : undefined;
}

export function getHelpCenterTracksProperties(
	properties: TracksProperties = {},
	{ explicitSiteId, siteId, primarySiteId, usePrimarySiteId = false }: SiteContext = {}
): TracksProperties {
	const blogId =
		getValidBlogId( properties.blog_id ) ??
		getValidBlogId( explicitSiteId ) ??
		getValidBlogId( siteId ) ??
		( usePrimarySiteId ? getValidBlogId( primarySiteId ) : undefined );
	const eventProperties = { ...properties };

	delete eventProperties.blog_id;
	if ( blogId ) {
		eventProperties.blog_id = blogId;
	}

	return eventProperties;
}

export function recordHelpCenterTracksEvent(
	eventName: string,
	properties: TracksProperties = {},
	siteContext: SiteContext = {}
) {
	recordTracksEvent( eventName, getHelpCenterTracksProperties( properties, siteContext ) );
}

export function useHelpCenterTracksEvent( {
	explicitSiteId,
	usePrimarySiteId = false,
}: Options = {} ) {
	const { site, primarySiteId } = useHelpCenterContext();
	const siteId = site?.ID;
	const siteContextRef = useRef< SiteContext >( {} );
	siteContextRef.current = {
		explicitSiteId,
		siteId,
		primarySiteId,
		usePrimarySiteId,
	};

	return useCallback( ( eventName: string, properties: TracksProperties = {} ) => {
		recordHelpCenterTracksEvent( eventName, properties, siteContextRef.current );
	}, [] );
}
