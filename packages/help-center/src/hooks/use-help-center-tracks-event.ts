import { recordTracksEvent, withSiteContext } from '@automattic/calypso-analytics';
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

export function getHelpCenterTracksProperties(
	properties: TracksProperties = {},
	{ explicitSiteId, siteId, primarySiteId, usePrimarySiteId = false }: SiteContext = {}
): TracksProperties {
	return withSiteContext( properties, [
		[ 'explicit', explicitSiteId ],
		[ 'help_center_context', siteId ],
		[ 'primary_site', usePrimarySiteId ? primarySiteId : undefined ],
	] );
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
