import { recordTracksEvent } from '@automattic/calypso-analytics';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useCommandState } from 'cmdk';
import { useCallback } from 'react';
import { SiteType } from './commands';
import { useCommandPaletteContext } from './context';
import { isCustomDomain } from './utils';
import type { Command, CommandCallBackParams } from './commands';
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

interface SiteToCommandParameters {
	selectedCommand: Command;
	filteredSitesLength: number;
	listVisibleCount: number;
	search: string;
}

const useSiteToCommand = () => {
	const { currentRoute } = useCommandPaletteContext();
	return useCallback(
		( {
			selectedCommand,
			filteredSitesLength,
			listVisibleCount,
			search,
		}: SiteToCommandParameters ) =>
			( site: SiteExcerptData ): Command => {
				const siteName = site.name || site.URL; // Use site.name if present, otherwise default to site.URL
				return {
					name: `${ site.ID }`,
					label: `${ siteName }`,
					subLabel: `${ site.URL }`,
					searchLabel: `${ site.ID } ${ siteName } ${ site.URL }`,
					callback: ( params ) => {
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
						selectedCommand.callback( { ...params, site, command: selectedCommand } );
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
};

const isCommandAvailableOnSite = (
	command: Command,
	site: SiteExcerptData,
	userCapabilities: { [ key: number ]: { [ key: string ]: boolean } }
): boolean => {
	const isAtomic = !! site.is_wpcom_atomic;
	const isJetpack = !! site.jetpack;
	const isSelfHosted = isJetpack && ! isAtomic;

	if ( command?.capability && ! userCapabilities[ site.ID ]?.[ command.capability ] ) {
		return false;
	}

	if ( command.siteType === SiteType.ATOMIC && ! isAtomic ) {
		return false;
	}

	if ( command.siteType === SiteType.JETPACK && ! isJetpack ) {
		return false;
	}

	if ( command?.isCustomDomain && ! isCustomDomain( site.slug ) ) {
		return false;
	}

	if ( command?.publicOnly && ( site.is_coming_soon || site.is_private ) ) {
		return false;
	}

	if ( command?.filterP2 && site.options?.is_wpforteams_site ) {
		return false;
	}

	if ( command?.filterStaging && site.is_wpcom_staging_site ) {
		return false;
	}

	if ( command?.filterSelfHosted && isSelfHosted ) {
		return false;
	}

	if (
		command?.adminInterface &&
		! isSelfHosted &&
		site.options?.wpcom_admin_interface !== command.adminInterface
	) {
		return false;
	}

	return true;
};

export const useCommandPalette = (): {
	commands: Command[];
	filterNotice: string | undefined;
	emptyListNotice: string | undefined;
	inSiteContext: boolean | undefined;
} => {
	const {
		currentSiteId,
		useCommands,
		currentRoute,
		useSites,
		userCapabilities,
		search,
		selectedCommandName,
		setSelectedCommandName,
	} = useCommandPaletteContext();
	const siteToCommand = useSiteToCommand();

	const listVisibleCount = useCommandState( ( state ) => state.filtered.count );

	const sites = useSites();

	const commands = useCommands();

	const { __ } = useI18n();

	const trackSelectedCommand = ( command: Command ) => {
		recordTracksEvent( 'calypso_hosting_command_palette_command_select', {
			command: command.name,
			has_nested_commands: !! command.siteSelector,
			list_count: commands.length,
			list_visible_count: listVisibleCount,
			current_route: currentRoute,
			search_text: search,
		} );
	};

	const currentSite = sites.find( ( site ) => site.ID === currentSiteId );
	const inSiteContext =
		currentSite && ( currentRoute.includes( ':site' ) || currentRoute.startsWith( '/wp-admin' ) );

	// Logic for selected command (sites)
	if ( selectedCommandName ) {
		const selectedCommand = commands.find( ( c ) => c.name === selectedCommandName );
		let sitesToPick = null;
		let filterNotice = undefined;
		let emptyListNotice = undefined;
		if ( selectedCommand?.siteSelector ) {
			let filteredSites = sites.filter( ( site ) =>
				isCommandAvailableOnSite( selectedCommand, site, userCapabilities )
			);
			if ( sites.length === 0 ) {
				emptyListNotice = __( "You don't have any sites yet.", __i18n_text_domain__ );
			} else if ( filteredSites.length === 0 ) {
				emptyListNotice = selectedCommand.emptyListNotice;
			}
			// Only show the filterNotice if there are some sites in the first place.
			if ( filteredSites.length > 0 ) {
				filterNotice = selectedCommand.filterNotice;
			}

			if ( currentSiteId ) {
				const currentSite = filteredSites.find( ( site ) => site.ID === currentSiteId );

				if ( currentSite ) {
					if ( selectedCommand.name === 'switchSite' ) {
						// Exclude the current site from the "Switch site" command;
						filteredSites = filteredSites.filter( ( site ) => site.ID !== currentSiteId );
						if ( filteredSites.length === 0 ) {
							emptyListNotice = selectedCommand.emptyListNotice;
						}
					} else {
						// Move current site to the top of the list
						filteredSites = [
							currentSite,
							...filteredSites.filter( ( site ) => site.ID !== currentSiteId ),
						];
					}
				}
			}

			// Map filtered sites to commands using the callback of the selected command.
			sitesToPick = filteredSites.map(
				siteToCommand( {
					selectedCommand,
					filteredSitesLength: filteredSites.length,
					listVisibleCount,
					search,
				} )
			);
		}

		return { commands: sitesToPick ?? [], filterNotice, emptyListNotice, inSiteContext };
	}

	// Logic for root commands
	// Filter out commands that have context
	const commandHasContext = (
		paths: ( string | { path: string; match: string } )[] = []
	): boolean => {
		return paths.some( ( pathItem ) => {
			if ( typeof pathItem === 'string' ) {
				return currentRoute.includes( pathItem ) ?? false;
			}

			return pathItem.match === 'exact'
				? currentRoute === pathItem.path
				: currentRoute.includes( pathItem.path ) ?? false;
		} );
	};

	// Sort commands with contextual commands ranking higher than general in a given context
	let sortedCommands = commands.sort( ( a, b ) => {
		const hasContextCommand = commandHasContext( a.context );
		const hasNoContext = commandHasContext( b.context );

		if ( hasContextCommand && ! hasNoContext ) {
			return -1; // commands with context come first if there is a context match
		} else if ( ! hasContextCommand && hasNoContext ) {
			return 1; // commands without context set
		}

		return 0; // no change in order
	} );

	// If we are on a current site context, filter and map the commands for single site use.
	if ( inSiteContext ) {
		sortedCommands = sortedCommands.filter( ( command ) =>
			isCommandAvailableOnSite( command, currentSite, userCapabilities )
		);

		sortedCommands = sortedCommands.map( ( command: Command ) => {
			if ( command?.alwaysUseSiteSelector ) {
				return command;
			}

			return {
				...command,
				siteSelector: false,
				callback: ( params ) => {
					command.callback( {
						...params,
						site: currentSite,
					} );
				},
			};
		} );
	}

	const finalSortedCommands = sortedCommands.map( ( command ) => {
		return {
			...command,
			callback: ( params: CommandCallBackParams ) => {
				// Inject a tracks event on the callback of each command.
				trackSelectedCommand( command );

				// Change the label when the site selector shows up and bail (the actual
				// callback should be executed only after a site has been selected).
				if ( command.siteSelector ) {
					params.setSearch( '' );
					setSelectedCommandName( command.name );
					params.setPlaceholderOverride( command.siteSelectorLabel || '' );
					return;
				}

				command.callback( params );
			},
		};
	} ) as Command[];

	// Add the "viewMySites" command to the beginning in all contexts except "/sites"
	if ( currentRoute !== '/sites' ) {
		const index = finalSortedCommands.findIndex( ( command ) => command.name === 'viewMySites' );
		if ( index > 0 ) {
			const [ element ] = finalSortedCommands.splice( index, 1 );
			finalSortedCommands.unshift( element );
		}
	}

	return {
		commands: finalSortedCommands,
		filterNotice: undefined,
		emptyListNotice: undefined,
		inSiteContext,
	};
};
