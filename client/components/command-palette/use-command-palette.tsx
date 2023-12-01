import { useSitesListSorting } from '@automattic/sites';
import styled from '@emotion/styled';
import SiteIcon from 'calypso/blocks/site-icon';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { useCommandsArrayWpcom } from 'calypso/sites-dashboard/components/wpcom-smp-commands';
import { useSitesSorting } from 'calypso/state/sites/hooks/use-sites-sorting';

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
interface useCommandPalletteOptions {
	selectedCommandName: string;
	setSelectedCommandName: ( name: string ) => void;
	filter?: ( command: Command ) => boolean | undefined;
}

const siteToAction =
	( onClickSite: OnClickSiteFunction ) =>
	( site: SiteExcerptData ): Command => {
		const siteName = site.name || site.URL; // Use site.name if present, otherwise default to site.URL

		return {
			name: `${ site.ID }`,
			label: `${ siteName }`,
			subLabel: `${ site.URL }`,
			searchLabel: `${ site.ID } ${ siteName } ${ site.URL }`,
			callback: ( { close }: { close: CloseFunction } ) => {
				onClickSite( { site, close } );
			},
			image: (
				<FillDefaultIconWhite>
					<SiteIcon site={ site } size={ 32 } />
				</FillDefaultIconWhite>
			),
		};
	};

export const useCommandPallette = ( {
	selectedCommandName,
	setSelectedCommandName,
	filter,
}: useCommandPalletteOptions ): { commands: Command[] } => {
	const { data: allSites = [] } = useSiteExcerptsQuery(
		[],
		( site ) => ! site.options?.is_domain_only
	);

	// Sort sites in the nested commands to be consistent with site switcher and /sites page
	const { sitesSorting } = useSitesSorting();
	const sortedSites = useSitesListSorting( allSites, sitesSorting );

	// Call the generateCommandsArray function to get the commands array
	const commands = useCommandsArrayWpcom( {
		setSelectedCommandName,
	} );

	// Simple sorting logic to prioritize commands with matching context
	const sortedCommands = commands.sort( ( a, b ) => {
		const hasContext = filter?.( a ) ?? false;
		const hasNoContext = filter?.( b ) ?? false;

		// Sort based on context
		if ( hasContext && ! hasNoContext ) {
			return -1; // commands with context set
		} else if ( ! hasContext && hasNoContext ) {
			return 1; // commands without context set
		}

		return 0; // no change in order
	} );

	const selectedCommand = sortedCommands.find( ( c ) => c.name === selectedCommandName );
	let sitesToPick = null;
	if ( selectedCommand?.siteFunctions ) {
		const { onClick, filter } = selectedCommand.siteFunctions;
		const filteredSites = filter ? sortedSites.filter( filter ) : sortedSites;
		sitesToPick = filteredSites.map( siteToAction( onClick ) );
	}

	return { commands: sitesToPick ?? sortedCommands };
};
