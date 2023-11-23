import styled from '@emotion/styled';
import React from 'react';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { useCommandsArrayWpcom } from 'calypso/sites-dashboard/components/wpcom-smp-commands';

const SiteImage = styled.img( {
	height: 24,
	width: 24,
	minWidth: 24,
	objectFit: 'cover',
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
interface Command {
	name: string;
	label: string | JSX.Element;
	searchLabel: string;
	callback: ( {
		close,
		setSearch,
	}: {
		close: CloseFunction;
		setSearch: ( search: string ) => void;
	} ) => void;
	context?: string;
	icon?: JSX.Element;
	image?: JSX.Element;
	siteFunctions?: SiteFunctions;
	separator?: boolean;
}
interface useCommandPalletteOptions {
	selectedCommandName: string;
	setSelectedCommandName: ( name: string ) => void;
}

const siteToAction =
	( onClickSite: OnClickSiteFunction ) =>
	( site: SiteExcerptData ): Command => {
		const siteName = site.name || site.URL; // Use site.name if present, otherwise default to "Site Title"

		return {
			name: `${ site.ID }`,
			label: (
				<React.Fragment>
					<span>{ siteName }</span>
					<span style={ { display: 'block' } }>{ site.URL }</span>
				</React.Fragment>
			),
			searchLabel: `${ site.ID } ${ siteName } ${ site.URL }`,
			callback: ( { close }: { close: CloseFunction } ) => {
				onClickSite( { site, close } );
			},
			image: (
				<SiteImage
					src={ site.icon?.img ?? '/calypso/images/favicons/favicon-development.ico' }
					alt={ siteName }
				/>
			),
		};
	};

export const useCommandPallette = ( {
	selectedCommandName,
	setSelectedCommandName,
}: useCommandPalletteOptions ): { commands: Command[] } => {
	const { data: allSites = [] } = useSiteExcerptsQuery(
		[],
		( site ) => ! site.options?.is_domain_only
	);

	// Call the generateCommandsArray function to get the commands array
	const commands = useCommandsArrayWpcom( { setSelectedCommandName } );

	const selectedCommand = commands.find( ( c ) => c.name === selectedCommandName );
	let sitesToPick = null;
	if ( selectedCommand?.siteFunctions ) {
		const { onClick, filter } = selectedCommand.siteFunctions;
		const filteredSites = filter ? allSites.filter( filter ) : allSites;
		sitesToPick = filteredSites.map( siteToAction( onClick ) );
	}

	return { commands: sitesToPick ?? commands };
};
