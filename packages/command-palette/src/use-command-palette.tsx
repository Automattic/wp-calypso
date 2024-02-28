import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { __ } from '@wordpress/i18n';
import { useCommandState } from 'cmdk';
import { useCallback } from 'react';
import { useCommandsParams } from './commands/types';
import { isCustomDomain } from './utils';
import type { SiteExcerptData } from '@automattic/sites';

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

export interface useExtraCommandsParams {
	setSelectedCommandName: ( name: string ) => void;
}

interface useCommandPaletteOptions {
	currentSiteId: number | null;
	selectedCommandName: string;
	setSelectedCommandName: ( name: string ) => void;
	search: string;
	navigate: ( path: string, openInNewTab?: boolean ) => void;
	useCommands: ( options: useCommandsParams ) => Command[];
	currentRoute: string | null;
	useSites: () => SiteExcerptData[];
	userCapabilities: { [ key: number ]: { [ key: string ]: boolean } };
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

const useSiteToAction = ( { currentRoute }: { currentRoute: string | null } ) => {
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
	currentSiteId,
	selectedCommandName,
	setSelectedCommandName,
	search,
	navigate,
	useCommands,
	currentRoute,
	useSites = () => [],
	userCapabilities = {},
}: useCommandPaletteOptions ): {
	commands: Command[];
	filterNotice: string | undefined;
	emptyListNotice: string | undefined;
} => {
	const siteToAction = useSiteToAction( { currentRoute } );

	const listVisibleCount = useCommandState( ( state ) => state.filtered.count );

	const sites = useSites();

	// Call the generateCommandsArray function to get the commands array
	const commands = useCommands( {
		setSelectedCommandName,
		navigate,
		currentRoute,
	} ) as Command[];

	// Logic for selected command (sites)
	if ( selectedCommandName ) {
		const selectedCommand = commands.find( ( c ) => c.name === selectedCommandName );
		let sitesToPick = null;
		let filterNotice = undefined;
		let emptyListNotice = undefined;
		if ( selectedCommand?.siteFunctions ) {
			const { capabilityFilter, onClick, filter } = selectedCommand.siteFunctions;
			let filteredSites = filter ? sites.filter( filter ) : sites;
			if ( capabilityFilter ) {
				filteredSites = filteredSites.filter( ( site ) => {
					const siteCapabilities = userCapabilities[ site.ID ];
					return siteCapabilities?.[ capabilityFilter ];
				} );
			}
			if ( sites.length === 0 ) {
				emptyListNotice = __( "You don't have any sites yet.", __i18n_text_domain__ );
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
