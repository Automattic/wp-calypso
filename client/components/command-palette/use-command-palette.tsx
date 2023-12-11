import { useSitesListSorting } from '@automattic/sites';
import styled from '@emotion/styled';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import SiteIcon from 'calypso/blocks/site-icon';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useCommandsArrayWpcom } from 'calypso/sites-dashboard/components/wpcom-smp-commands';
import { useDispatch } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
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
}

const useSiteToAction = () => {
	const dispatch = useDispatch();
	const siteToAction = useCallback(
		( onClickSite: OnClickSiteFunction, selectedCommand: Command ) =>
			( site: SiteExcerptData ): Command => {
				const siteName = site.name || site.URL; // Use site.name if present, otherwise default to site.URL

				return {
					name: `${ site.ID }`,
					label: `${ siteName }`,
					subLabel: `${ site.URL }`,
					searchLabel: `${ site.ID } ${ siteName } ${ site.URL }`,
					callback: ( { close }: { close: CloseFunction } ) => {
						dispatch(
							recordTracksEvent( 'calypso_command_palette_site_clicked', {
								site_id: site.ID,
								command_name: selectedCommand.name,
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
		[ dispatch ]
	);

	return siteToAction;
};

export const useCommandPalette = ( {
	selectedCommandName,
	setSelectedCommandName,
}: useCommandPaletteOptions ): { commands: Command[] } => {
	const { data: allSites = [] } = useSiteExcerptsQuery(
		[],
		( site ) => ! site.options?.is_domain_only
	);
	const dispatch = useDispatch();
	const siteToAction = useSiteToAction();

	// Sort sites in the nested commands to be consistent with site switcher and /sites page
	const { sitesSorting } = useSitesSorting();
	const sortedSites = useSitesListSorting( allSites, sitesSorting );

	// Get current site ID to rank it to the top of the sites list
	const { currentSiteId } = useCurrentSiteRankTop();

	// Call the generateCommandsArray function to get the commands array
	const commands = useCommandsArrayWpcom( {
		setSelectedCommandName,
	} );

	const currentPath = useSelector( ( state: object ) => getCurrentRoute( state ) );

	// Filter out commands that have context
	const commandHasContext = ( paths: string[] = [] ): boolean =>
		paths.some( ( path ) => currentPath.includes( path ) ) ?? false;

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
				recordTracksEvent( 'calypso_command_palette_command_clicked', {
					command_name: command.name,
					has_nested_command: !! command.siteFunctions,
				} )
			);
			command.callback( params );
		},
	} ) );

	// Add the "viewMySites" command to the beginning in all contexts except "/sites"
	if ( viewMySitesCommand && currentPath !== '/sites' ) {
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
		sitesToPick = filteredSites.map( siteToAction( onClick, selectedCommand ) );
	}

	return { commands: sitesToPick ?? finalSortedCommands };
};
