import { useSitesListSorting } from '@automattic/sites';
import styled from '@emotion/styled';
import { useCommandState } from 'cmdk';
import { useCallback } from 'react';
import SiteIcon from 'calypso/blocks/site-icon';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { useCommandsArrayWpcom } from 'calypso/sites-dashboard/components/wpcom-smp-commands';
import { isCustomDomain } from 'calypso/sites-dashboard/utils';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentRoutePattern } from 'calypso/state/selectors/get-current-route-pattern';
import { useSitesSorting } from 'calypso/state/sites/hooks/use-sites-sorting';
import { useCurrentSiteRankTop } from './use-current-site-rank-top';

const FillDefaultIconWhite = styled.div( {
	flexShrink: 0,
	'.commands-command-menu__container [cmdk-item] & svg': {
		fill: '#fff',
	},
} );

type CloseFunction = () => void;
type OnClickSiteFunction = ( {
	close,
	site,
}: {
	close: CloseFunction;
	site: SiteExcerptData;
} ) => void;
interface SiteFunctions {
	onClick: ( { site, close }: { site: SiteExcerptData; close: CloseFunction } ) => void;
	filter?: ( site: SiteExcerptData ) => boolean | undefined | null;
}
export interface CommandCallBackParams {
	close: CloseFunction;
	setSearch: ( search: string ) => void;
	setPlaceholderOverride: ( placeholder: string ) => void;
}

interface Command {
	name: string;
	label: string;
	subLabel?: string;
	searchLabel?: string;
	callback: ( params: CommandCallBackParams ) => void;
	context?: string[];
	icon?: JSX.Element;
	image?: JSX.Element;
	siteFunctions?: SiteFunctions;
}
interface useCommandPaletteOptions {
	selectedCommandName: string;
	setSelectedCommandName: ( name: string ) => void;
	search: string;
}

interface SiteToActionParameters {
	onClickSite: OnClickSiteFunction;
	properties: {
		selectedCommand: Command;
		filteredSitesLength: number;
		listVisibleCount: number;
		search: string;
	};
}

const useSiteToAction = () => {
	const dispatch = useDispatch();
	const currentRoute = useSelector( ( state: object ) => getCurrentRoutePattern( state ) );

	const siteToAction = useCallback(
		(
			onClickSite: SiteToActionParameters[ 'onClickSite' ],
			{
				selectedCommand,
				filteredSitesLength,
				listVisibleCount,
				search,
			}: SiteToActionParameters[ 'properties' ]
		) =>
			( site: SiteExcerptData ): Command => {
				const siteName = site.name || site.URL; // Use site.name if present, otherwise default to site.URL
				return {
					name: `${ site.ID }`,
					label: `${ siteName }`,
					subLabel: `${ site.URL }`,
					searchLabel: `${ site.ID } ${ siteName } ${ site.URL }`,
					callback: ( { close }: { close: CloseFunction } ) => {
						dispatch(
							recordTracksEvent( 'calypso_hosting_command_palette_site_select', {
								command: selectedCommand.name,
								list_count: filteredSitesLength,
								list_visible_count: listVisibleCount,
								current_route: currentRoute,
								search_text: search,
								command_site_id: site.ID,
								command_site_has_custom_domain: isCustomDomain( site.slug ),
								command_site_plan_id: site.plan?.product_id,
							} )
						);
						onClickSite( { site, close } );
					},
					image: (
						<FillDefaultIconWhite>
							<SiteIcon site={ site } size={ 32 } />
						</FillDefaultIconWhite>
					),
				};
			},
		[ currentRoute, dispatch ]
	);

	return siteToAction;
};

export const useCommandPalette = ( {
	selectedCommandName,
	setSelectedCommandName,
	search,
}: useCommandPaletteOptions ): { commands: Command[] } => {
	const { data: allSites = [] } = useSiteExcerptsQuery(
		[],
		( site ) => ! site.options?.is_domain_only
	);
	const dispatch = useDispatch();
	const siteToAction = useSiteToAction();

	const listVisibleCount = useCommandState( ( state ) => state.filtered.count );

	// Sort sites in the nested commands to be consistent with site switcher and /sites page
	const { sitesSorting } = useSitesSorting();
	const sortedSites = useSitesListSorting( allSites, sitesSorting );

	// Get current site ID to rank it to the top of the sites list
	const { currentSiteId } = useCurrentSiteRankTop();

	// Call the generateCommandsArray function to get the commands array
	const commands = useCommandsArrayWpcom( {
		setSelectedCommandName,
	} );

	const currentRoute = useSelector( ( state: object ) => getCurrentRoutePattern( state ) );

	// Filter out commands that have context
	const commandHasContext = ( paths: string[] = [] ): boolean =>
		paths.some( ( path ) => currentRoute?.includes( path ) ) ?? false;

	// Find and store the "viewMySites" command
	const viewMySitesCommand = commands.find( ( command ) => command.name === 'viewMySites' );

	// Sort the commands with the contextual commands ranking higher than general in a given context
	const sortedCommands = commands
		.filter( ( command ) => ! ( command === viewMySitesCommand ) )
		.sort( ( a, b ) => {
			const hasContextCommand = commandHasContext( a.context );
			const hasNoContext = commandHasContext( b.context );

			if ( hasContextCommand && ! hasNoContext ) {
				return -1; // commands with context come first if there is a context match
			} else if ( ! hasContextCommand && hasNoContext ) {
				return 1; // commands without context set
			}

			return 0; // no change in order
		} );

	// Create a variable to hold the final result
	const finalSortedCommands = sortedCommands.map( ( command ) => ( {
		...command,
		callback: ( params: CommandCallBackParams ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_command_palette_command_select', {
					command: command.name,
					has_nested_commands: !! command.siteFunctions,
					list_count: commands.length,
					list_visible_count: listVisibleCount,
					current_route: currentRoute,
					search_text: search,
				} )
			);
			command.callback( params );
		},
	} ) );

	// Add the "viewMySites" command to the beginning in all contexts except "/sites"
	if ( viewMySitesCommand && currentRoute !== '/sites' ) {
		finalSortedCommands.unshift( viewMySitesCommand );
	}

	const selectedCommand = finalSortedCommands.find( ( c ) => c.name === selectedCommandName );
	let sitesToPick = null;
	if ( selectedCommand?.siteFunctions ) {
		const { onClick, filter } = selectedCommand.siteFunctions;
		let filteredSites = filter ? sortedSites.filter( filter ) : sortedSites;
		if ( currentSiteId ) {
			const currentSite = filteredSites.find( ( site ) => site.ID === currentSiteId );
			if ( currentSite ) {
				filteredSites = [
					currentSite,
					...filteredSites.filter( ( site ) => site.ID !== currentSiteId ),
				];
			}
		}
		sitesToPick = filteredSites.map(
			siteToAction( onClick, {
				selectedCommand,
				filteredSitesLength: filteredSites.length,
				listVisibleCount,
				search,
			} )
		);
	}

	return { commands: sitesToPick ?? finalSortedCommands };
};
