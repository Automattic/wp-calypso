import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { useAddNewSiteUrl } from 'calypso/lib/paths/use-add-new-site-url';
import { generateCommandsArrayWpcom } from 'calypso/sites-dashboard/components/wpcom-smp-commands';

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
	label: string;
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
		return {
			name: `${ site.ID }`,
			label: `${ site.name }: ${ site.URL }`,
			searchLabel: `${ site.ID } ${ site.name } ${ site.URL }`,
			callback: ( { close }: { close: CloseFunction } ) => {
				onClickSite( { site, close } );
			},
			image: (
				<SiteImage
					src={ site.icon?.img ?? '/calypso/images/favicons/favicon-development.ico' }
					alt={ site.name }
				/>
			),
		};
	};

export const useCommandPallette = ( {
	selectedCommandName,
	setSelectedCommandName,
}: useCommandPalletteOptions ) => {
	const { __ } = useI18n();
	const createSiteUrl = useAddNewSiteUrl( {
		source: 'sites-dashboard-command-palette',
		ref: 'topbar',
	} );
	const { data: allSites = [] } = useSiteExcerptsQuery(
		[],
		( site ) => ! site.options?.is_domain_only
	);

	// Call the generateCommandsArray function to get the commands array
	const commands = generateCommandsArrayWpcom( { setSelectedCommandName, __, createSiteUrl } );

	const selectedCommand = commands.find( ( c ) => c.name === selectedCommandName );
	let sitesToPick = null;
	if ( selectedCommand?.siteFunctions ) {
		const { onClick, filter } = selectedCommand.siteFunctions;
		const filteredSites = filter ? allSites.filter( filter ) : allSites;
		sitesToPick = filteredSites.map( siteToAction( onClick ) );
	}

	return { commands: sitesToPick ?? commands };
};
