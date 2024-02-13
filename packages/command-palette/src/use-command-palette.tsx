import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gridicon } from '@automattic/components';
import { useSitesListSorting } from '@automattic/sites';
import styled from '@emotion/styled';
import { __ } from '@wordpress/i18n';
import { useCommandState } from 'cmdk';
import { useCallback } from 'react';
//import { useCurrentSiteRankTop } from './use-current-site-rank-top';
import { useCommands } from './use-commands';
import { SiteData, useSites } from './use-sites';
import { useSitesSortingQuery } from './use-sites-sorting-query';
import { isCustomDomain } from './utils';
import type { WPCOM } from 'wpcom';

const FillDefaultIconWhite = styled.div( {
	flexShrink: 0,
	'.commands-command-menu__container [cmdk-item] & svg': {
		fill: '#fff',
	},
} );

const SiteIcon = styled.img( {
	width: '32px',
	verticalAlign: 'middle',
} );

const EmptySiteIcon = styled.div( {
	width: '32px',
	height: '32px',
	background: 'var(--color-neutral-10)',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
} );

type CloseFunction = ( commandName?: string, isExecuted?: boolean ) => void;
type OnClickSiteFunction = ( {
	close,
	site,
	command,
}: {
	close: CloseFunction;
	site: SiteData;
	command: Command;
} ) => void;
interface SiteFunctions {
	capabilityFilter?: string;
	onClick: OnClickSiteFunction;
	filter?: ( site: SiteData ) => boolean | undefined | null;
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

export interface useExtraCommandsParams {
	setSelectedCommandName: ( name: string ) => void;
}

interface useCommandPaletteOptions {
	selectedCommandName: string;
	setSelectedCommandName: ( name: string ) => void;
	search: string;
	navigate: ( path: string, openInNewTab: boolean ) => void;
	useExtraCommands?: ( options: useExtraCommandsParams ) => Command[];
	wpcom: WPCOM;
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
	// TODO: Find an alternative way to use the current route.
	//const currentRoute = useSelector( ( state: object ) => getCurrentRoutePattern( state ) );
	const currentRoute = window.location.pathname;

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
			( site: SiteData ): Command => {
				const siteName = site.name || site.URL; // Use site.name if present, otherwise default to site.URL
				return {
					name: `${ site.ID }`,
					label: `${ siteName }`,
					subLabel: `${ site.URL }`,
					searchLabel: `${ site.ID } ${ siteName } ${ site.URL }`,
					callback: ( { close } ) => {
						recordTracksEvent( 'calypso_hosting_command_palette_site_select', {
							command: selectedCommand.name,
							list_count: filteredSitesLength,
							list_visible_count: listVisibleCount,
							current_route: currentRoute,
							search_text: search,
							command_site_id: site.ID,
							command_site_has_custom_domain: isCustomDomain( site.slug ),
							command_site_plan_id: site.plan?.product_id,
						} );
						onClickSite( { site, close, command: selectedCommand } );
					},
					image: (
						<FillDefaultIconWhite>
							{ site.icon?.img ? (
								<SiteIcon src={ site.icon.img } alt="" />
							) : (
								<EmptySiteIcon>
									<Gridicon icon="globe" />
								</EmptySiteIcon>
							) }
						</FillDefaultIconWhite>
					),
				};
			},
		[ currentRoute ]
	);

	return siteToAction;
};

export const useCommandPalette = ( {
	selectedCommandName,
	setSelectedCommandName,
	search,
	navigate,
	useExtraCommands,
	wpcom,
}: useCommandPaletteOptions ): {
	commands: Command[];
	filterNotice: string | undefined;
	emptyListNotice: string | undefined;
} => {
	const { data: allSites = [] } = useSites( wpcom );
	const siteToAction = useSiteToAction();

	const listVisibleCount = useCommandState( ( state ) => state.filtered.count );

	// Sort sites in the nested commands to be consistent with site switcher and /sites page
	const { data: sitesSorting } = useSitesSortingQuery( wpcom );
	const sortedSites = useSitesListSorting( allSites, sitesSorting );

	// Get current site ID to rank it to the top of the sites list
	// TODO: Find an alternative way to get the current site ID.
	//const { currentSiteId } = useCurrentSiteRankTop();
	const currentSiteId = null;

	// Call the generateCommandsArray function to get the commands array
	const defaultCommands = useCommands( {
		setSelectedCommandName,
		navigate,
	} ) as Command[];

	// TODO: Remove after porting all commands.
	if ( ! useExtraCommands ) {
		useExtraCommands = () => [];
	}
	const extraCommands = useExtraCommands( { setSelectedCommandName } );
	const commands = defaultCommands.concat( extraCommands );

	// TODO: Find an alternative way to use the current route.
	//const currentRoute = useSelector( ( state: object ) => getCurrentRoutePattern( state ) );
	const currentRoute = window.location.pathname;

	const userCapabilities: { [ key: number ]: { [ key: string ]: boolean }[] } = {};
	// @ts-expect-error TODO
	allSites.forEach( ( site ) => {
		userCapabilities[ site.ID ] = site.capabilities;
	} );

	// Logic for selected command (sites)
	if ( selectedCommandName ) {
		const selectedCommand = commands.find( ( c ) => c.name === selectedCommandName );
		let sitesToPick = null;
		let filterNotice = undefined;
		let emptyListNotice = undefined;
		if ( selectedCommand?.siteFunctions ) {
			const { capabilityFilter, onClick, filter } = selectedCommand.siteFunctions;
			// @ts-expect-error TODO
			let filteredSites = filter ? sortedSites.filter( filter ) : sortedSites;
			if ( capabilityFilter ) {
				filteredSites = filteredSites.filter( ( site ) => {
					const siteCapabilities = userCapabilities[ site.ID ];
					// @ts-expect-error TODO
					return siteCapabilities?.[ capabilityFilter ];
				} );
			}
			if ( sortedSites.length === 0 ) {
				emptyListNotice = __( "You don't have any sites yet.", __i18n_text_domain__ );
			} else if ( filteredSites.length === 0 ) {
				emptyListNotice = selectedCommand.siteFunctions?.emptyListNotice;
			}
			// Only show the filterNotice if there are some sites in the first place.
			if ( filteredSites.length > 0 ) {
				filterNotice = selectedCommand.siteFunctions?.filterNotice;
			}

			if ( currentSiteId ) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore TODO
				const currentSite = filteredSites.find( ( site ) => site.ID === currentSiteId );

				if ( currentSite ) {
					// Move current site to the top of the list
					filteredSites = [
						currentSite,
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore TODO
						...filteredSites.filter( ( site ) => site.ID !== currentSiteId ),
					];
				}
			}

			// Map filtered sites to actions using the onClick function
			sitesToPick = filteredSites.map(
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore TODO
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
			recordTracksEvent( 'calypso_hosting_command_palette_command_select', {
				command: command.name,
				has_nested_commands: !! command.siteFunctions,
				list_count: commands.length,
				list_visible_count: listVisibleCount,
				current_route: currentRoute,
				search_text: search,
			} );
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
