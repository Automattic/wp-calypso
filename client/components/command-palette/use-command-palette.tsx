import { useSitesListSorting } from '@automattic/sites';
import styled from '@emotion/styled';
import { __ } from '@wordpress/i18n';
// Avoiding wpcom-smp-commands for now, so loading this here for the one hard-coded command
import { wordpress as wordpressIcon } from '@wordpress/icons';
import { useCommandState } from 'cmdk';
import { useCallback } from 'react';
import SiteIcon from 'calypso/blocks/site-icon';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
// Avoiding wpcom-smp-commands for now, so loading navigate here for the one hard-coded command
//import { useCommandsArrayWpcom } from 'calypso/sites-dashboard/components/wpcom-smp-commands';
import { navigate } from 'calypso/lib/navigate';
import { isCustomDomain } from 'calypso/sites-dashboard/utils';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentRoutePattern } from 'calypso/state/selectors/get-current-route-pattern';
import { useSitesSorting } from 'calypso/state/sites/hooks/use-sites-sorting';
import { useCurrentSiteRankTop } from './use-current-site-rank-top';
import type { AppState } from 'calypso/types';

const FillDefaultIconWhite = styled.div( {
	flexShrink: 0,
	'.commands-command-menu__container [cmdk-item] & svg': {
		fill: '#fff',
	},
} );

type CloseFunction = ( commandName?: string, isExecuted?: boolean ) => void;
type OnClickSiteFunction = ( {
	close,
	site,
	command,
}: {
	close: CloseFunction;
	site: SiteExcerptData;
	command: Command;
} ) => void;
interface SiteFunctions {
	capabilityFilter?: string;
	onClick: OnClickSiteFunction;
	filter?: ( site: SiteExcerptData ) => boolean | undefined | null;
	filterNotice?: string;
	emptyListNotice?: string;
}
export interface CommandCallBackParams {
	close: CloseFunction;
	setSearch: ( search: string ) => void;
	setPlaceholderOverride: ( placeholder: string ) => void;
	command: Command;
}

export interface Command {
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
					callback: ( { close } ) => {
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
						onClickSite( { site, close, command: selectedCommand } );
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
}: useCommandPaletteOptions ): {
	commands: Command[];
	filterNotice: string | undefined;
	emptyListNotice: string | undefined;
} => {
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
	// Or not, because we're avoiding wpcom-smp-commands for now so we can just prove the concept
	// with a single hard-coded light command.
	/*
	const commands = useCommandsArrayWpcom( {
		setSelectedCommandName,
	} ) as Command[];
	*/
	const commands = [
		{
			name: 'viewMySites',
			label: __( 'View my sites' ),
			searchLabel: [ 'view my sites', 'manage sites', 'sites dashboard' ].join( ' ' ),
			callback: () => navigate( `/sites` ),
			icon: wordpressIcon,
		},
	] as Command[];

	const currentRoute = useSelector( ( state: object ) => getCurrentRoutePattern( state ) );

	const userCapabilities = useSelector( ( state: AppState ) => state.currentUser.capabilities );

	// Logic for selected command (sites)
	if ( selectedCommandName ) {
		const selectedCommand = commands.find( ( c ) => c.name === selectedCommandName );
		let sitesToPick = null;
		let filterNotice = undefined;
		let emptyListNotice = undefined;
		if ( selectedCommand?.siteFunctions ) {
			const { capabilityFilter, onClick, filter } = selectedCommand.siteFunctions;
			let filteredSites = filter ? sortedSites.filter( filter ) : sortedSites;
			filteredSites = capabilityFilter
				? filteredSites.filter( ( site ) => {
						const siteCapabilities = userCapabilities[ site.ID ];
						return siteCapabilities?.[ capabilityFilter ];
				  } )
				: filteredSites;
			if ( sortedSites.length === 0 ) {
				emptyListNotice = __( "You don't have any sites yet." );
			} else if ( filteredSites.length === 0 ) {
				emptyListNotice = selectedCommand.siteFunctions?.emptyListNotice;
			}
			// Only show the filterNotice if there are some sites in the first place.
			if ( filteredSites.length > 0 ) {
				filterNotice = selectedCommand.siteFunctions?.filterNotice;
			}

			if ( currentSiteId ) {
				const currentSite = filteredSites.find( ( site ) => site.ID === currentSiteId );

				if ( currentSite ) {
					// Move current site to the top of the list
					filteredSites = [
						currentSite,
						...filteredSites.filter( ( site ) => site.ID !== currentSiteId ),
					];
				}
			}

			// Map filtered sites to actions using the onClick function
			sitesToPick = filteredSites.map(
				siteToAction( onClick, {
					selectedCommand,
					filteredSitesLength: filteredSites.length,
					listVisibleCount,
					search,
				} )
			);
		}

		return { commands: sitesToPick ?? [], filterNotice, emptyListNotice };
	}

	// Logic for root commands
	// Filter out commands that have context
	const commandHasContext = ( paths: string[] = [] ): boolean =>
		paths.some( ( path ) => currentRoute?.includes( path ) ) ?? false;

	const viewMySitesCommand = commands.find( ( command ) => command.name === 'viewMySites' );

	// Sort commands with contextual commands ranking higher than general in a given context
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

	// Inject a tracks event on the callback of each command
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

	// Return the sorted commands
	return { commands: finalSortedCommands, filterNotice: undefined, emptyListNotice: undefined };
};
