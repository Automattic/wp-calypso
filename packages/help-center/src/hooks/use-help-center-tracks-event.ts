import { getValidBlogId, recordTracksEvent, withSiteContext } from '@automattic/calypso-analytics';
import { useCallback, useRef } from '@wordpress/element';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';

type TracksProperties = Record< string, unknown >;

type SiteContext = {
	explicitSiteId?: unknown;
	siteId?: unknown;
	primarySiteId?: unknown;
};

type Options = Pick< SiteContext, 'explicitSiteId' >;

export function getHelpCenterTracksProperties(
	properties: TracksProperties = {},
	{ explicitSiteId, siteId, primarySiteId }: SiteContext = {}
): TracksProperties {
	if ( getValidBlogId( explicitSiteId ) ) {
		return withSiteContext( properties, 'explicit', explicitSiteId );
	}

	if ( getValidBlogId( siteId ) ) {
		return withSiteContext( properties, 'help_center_context', siteId );
	}

	return withSiteContext( properties, 'primary_site', primarySiteId );
}

export function recordHelpCenterTracksEvent(
	eventName: string,
	properties: TracksProperties = {},
	siteContext: SiteContext = {}
) {
	recordTracksEvent( eventName, getHelpCenterTracksProperties( properties, siteContext ) );
}

export function useHelpCenterTracksEvent( { explicitSiteId }: Options = {} ) {
	const { site, primarySiteId } = useHelpCenterContext();
	const siteId = site?.ID;
	const siteContextRef = useRef< SiteContext >( {} );
	siteContextRef.current = { explicitSiteId, siteId, primarySiteId };

	return useCallback( ( eventName: string, properties: TracksProperties = {} ) => {
		recordHelpCenterTracksEvent( eventName, properties, siteContextRef.current );
	}, [] );
}
