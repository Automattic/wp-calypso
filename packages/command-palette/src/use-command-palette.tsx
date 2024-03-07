import { recordTracksEvent } from '@automattic/calypso-analytics';
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
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										width="24"
										height="24"
									>
										<rect x="0" fill="none" width="24" height="24" />
										<g>
											<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18l2-2 1-1v-2h-2v-1l-1-1H9v3l2 2v1.931C7.06 19.436 4 16.072 4 12l1 1h2v-2h2l3-3V6h-2L9 5v-.411a7.945 7.945 0 016 0V6l-1 1v2l1 1 3.13-3.13A7.983 7.983 0 0119.736 10H18l-2 2v2l1 1h2l.286.286C18.029 18.061 15.239 20 12 20z" />
										</g>
									</svg>
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

	const filterCurrentSiteCommands = ( site: SiteExcerptData, command: Command ) => {
		const { capabilityFilter = false, filter = () => true } = command?.siteFunctions ?? {};
		let hasCapability = true;
		if ( capabilityFilter ) {
			hasCapability = userCapabilities?.[ site.ID ]?.[ capabilityFilter ] ?? false;
		}

		return filter?.( site ) && hasCapability;
	};

	const trackCompletedCommand = ( command: Command ) => {
		recordTracksEvent( 'calypso_hosting_command_palette_command_complete', {
			command: command.name,
			list_count: commands.length,
			list_visible_count: listVisibleCount,
			current_route: currentRoute,
			search_text: search,
		} );
	};

	const trackSelectedCommand = ( command: Command ) => {
		const hasNestedCommands = !! command.siteFunctions;
		recordTracksEvent( 'calypso_hosting_command_palette_command_select', {
			command: command.name,
			has_nested_commands: hasNestedCommands,
			list_count: commands.length,
			list_visible_count: listVisibleCount,
			current_route: currentRoute,
			search_text: search,
		} );

		if ( ! hasNestedCommands ) {
			trackCompletedCommand( command );
		}
	};

	// Logic for selected command (sites)
	if ( selectedCommandName ) {
		const selectedCommand = commands.find( ( c ) => c.name === selectedCommandName );
		let sitesToPick = null;
		let filterNotice = undefined;
		let emptyListNotice = undefined;
		if ( selectedCommand?.siteFunctions ) {
			const { capabilityFilter, onClick, filter } = selectedCommand.siteFunctions;

			const onClickSite: OnClickSiteFunction = ( { close, command, site } ) => {
				onClick( { close, command, site } );
				trackCompletedCommand( command );
			};

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
				siteToAction( onClickSite, {
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
	let finalSortedCommands = sortedCommands.map( ( command ) => ( {
		...command,
		callback: ( params: CommandCallBackParams ) => {
			trackSelectedCommand( command );
			command.callback( params );
		},
	} ) );

	// Add the "viewMySites" command to the beginning in all contexts except "/sites"
	if ( viewMySitesCommand && currentRoute !== '/sites' ) {
		finalSortedCommands.unshift( viewMySitesCommand );
	}

	const currentSite = sites.find( ( site ) => site.ID === currentSiteId );

	// If we have a current site and the route includes the site slug, filter and map the commands for single site use.
	if ( currentSite && currentRoute?.includes( ':site' ) ) {
		finalSortedCommands = finalSortedCommands.filter( ( command ) =>
			filterCurrentSiteCommands( currentSite, command )
		);

		finalSortedCommands = finalSortedCommands.map( ( command: Command ) => {
			const callback = ( params: CommandCallBackParams ) => {
				let targetFunction;
				const isMultiSiteCommand = command?.siteFunctions !== undefined;
				if ( isMultiSiteCommand ) {
					targetFunction = command?.siteFunctions?.onClick;
					// We need to track the selected command event here because `command.siteFunctions.onClick`
					// does not track anything (and it's not meant to).
					trackSelectedCommand( command );
				} else {
					// We don't need to track the selected command event here because `command.callback`
					// already does it (see how `finalSortedCommands` is created a few lines above).
					targetFunction = command.callback;
				}

				return targetFunction( {
					close: params.close,
					site: currentSite,
					setSearch: params.setSearch,
					setPlaceholderOverride: params.setPlaceholderOverride,
					command,
				} );
			};

			return {
				name: command.name,
				label: command.label,
				...( command.subLabel ? { subLabel: command.subLabel } : {} ),
				...( command.searchLabel ? { searchLabel: command.searchLabel } : {} ),
				...( command.context ? { context: command.context } : {} ),
				...( command.icon ? { icon: command.icon } : {} ),
				...( command.image ? { image: command.image } : {} ),
				callback,
			};
		} );
	}

	return { commands: finalSortedCommands, filterNotice: undefined, emptyListNotice: undefined };
};
