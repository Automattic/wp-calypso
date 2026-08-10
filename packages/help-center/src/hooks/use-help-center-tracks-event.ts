import { recordTracksEvent, withSiteContext } from '@automattic/calypso-analytics';
import { useCallback, useRef } from '@wordpress/element';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';

type TracksProperties = Record< string, unknown >;

type SiteContext = {
	explicitSiteId?: unknown;
	siteId?: unknown;
};

type Options = Pick< SiteContext, 'explicitSiteId' >;

export function getHelpCenterTracksProperties(
	properties: TracksProperties = {},
	{ explicitSiteId, siteId }: SiteContext = {}
): TracksProperties {
	return withSiteContext( properties, [
		[ 'explicit', explicitSiteId ],
		[ 'help_center_context', siteId ],
	] );
}

export function recordHelpCenterTracksEvent(
	eventName: string,
	properties: TracksProperties = {},
	siteContext: SiteContext = {}
) {
	recordTracksEvent( eventName, getHelpCenterTracksProperties( properties, siteContext ) );
}

export function useHelpCenterTracksEvent( { explicitSiteId }: Options = {} ) {
	const { site } = useHelpCenterContext();
	const siteId = site?.ID;
	const siteContextRef = useRef< SiteContext >( {} );
	siteContextRef.current = { explicitSiteId, siteId };

	return useCallback( ( eventName: string, properties: TracksProperties = {} ) => {
		recordHelpCenterTracksEvent( eventName, properties, siteContextRef.current );
	}, [] );
}
