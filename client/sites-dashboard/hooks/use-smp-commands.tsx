import styled from '@emotion/styled';
import {
	plus as addNewSiteIcon,
	code as sshIcon,
	globe as domainsIcon,
	settings as hostingConfigurationIcon,
	page as newPageIcon,
	edit as newPostIcon,
	upload as publishIcon,
	external as viewSitehIcon,
} from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { navigate } from 'calypso/lib/navigate';
import { useAddNewSiteUrl } from 'calypso/lib/paths/use-add-new-site-url';
import { isCustomDomain, isNotAtomicJetpack } from '../utils';

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
interface UseSMPCommands {
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
export const useSMPCommands = ( {
	selectedCommandName,
	setSelectedCommandName,
}: UseSMPCommands ) => {
	const { __ } = useI18n();
	const createSiteUrl = useAddNewSiteUrl( {
		source: 'sites-dashboard-command-palette',
		ref: 'topbar',
	} );
	const { data: allSites = [] } = useSiteExcerptsQuery(
		[],
		( site ) => ! site.options?.is_domain_only
	);
	const commands: Command[] = useMemo( () => {
		const setStateCallback: ( actionName: string ) => Command[ 'callback' ] =
			( actionName: string ) =>
			( { setSearch } ) => {
				setSearch( '' );
				setSelectedCommandName( actionName );
			};
		return [
			{
				name: 'ssh',
				label: __( 'SSH' ),
				searchLabel: __( 'ssh' ),
				context: 'Accessing via SSH',
				callback: setStateCallback( 'ssh' ),
				siteFunctions: {
					onClick: ( { site, close } ) => {
						close();
						navigate( `/hosting-config/${ site.slug }#sftp-credentials` );
					},
					filter: ( site ) => site?.is_wpcom_atomic,
				},
				icon: sshIcon,
			},
			{
				name: 'domains',
				label: __( 'Domains' ),
				searchLabel: __( 'domains' ),
				context: 'Managing domains',
				callback: setStateCallback( 'domains' ),
				siteFunctions: {
					onClick: ( { site, close } ) => {
						close();
						navigate( `/domains/manage/${ site.slug }/dns/${ site.slug }` );
					},
					filter: ( site ) => isCustomDomain( site.slug ) && ! isNotAtomicJetpack( site ),
				},
				icon: domainsIcon,
			},
			{
				name: 'hostingConfiguration',
				label: __( 'Hosting Configuration' ),
				searchLabel: __( 'hosting' ),
				context: 'Configuring hosting settings',
				callback: setStateCallback( 'hostingConfiguration' ),
				siteFunctions: {
					onClick: ( { site, close } ) => {
						close();
						navigate( `/hosting-config/${ site.slug }` );
					},
					filter: ( site ) => site?.is_wpcom_atomic,
				},
				icon: hostingConfigurationIcon,
			},
			{
				name: 'newPage',
				label: __( 'New Page' ),
				searchLabel: __( 'create page' ),
				context: 'Adding a new page',
				callback: setStateCallback( 'newPage' ),
				siteFunctions: {
					onClick: ( { site, close } ) => {
						close();
						navigate( `/page/${ site.slug }` );
					},
				},
				icon: newPageIcon,
			},
			{
				name: 'newPost',
				label: __( 'New Post' ),
				searchLabel: __( 'create post' ),
				context: 'Adding a new post',
				callback: setStateCallback( 'newPost' ),
				siteFunctions: {
					onClick: ( { site, close } ) => {
						close();
						navigate( `/post/${ site.slug }` );
					},
				},
				icon: newPostIcon,
			},
			{
				name: 'publish',
				label: __( 'Publish' ),
				searchLabel: __( 'publish content' ),
				context: 'Publishing the content',
				callback: setStateCallback( 'publish' ),
				siteFunctions: {
					onClick: ( { site, close } ) => {
						close();
						navigate( `/settings/general/${ site.slug }#site-privacy-settings` );
					},
					filter: ( site ) => site?.launch_status === 'unlaunched',
				},
				icon: publishIcon,
			},
			{
				name: 'view',
				label: __( 'View site' ),
				searchLabel: __( 'view public site frontend' ),
				context: 'Publishing the content',
				callback: setStateCallback( 'view' ),
				siteFunctions: {
					onClick: ( { site, close } ) => {
						close();
						navigate( site.URL );
					},
				},
				icon: viewSitehIcon,
			},
			{
				name: 'addNewSite',
				label: __( 'Add New Site' ),
				searchLabel: __( 'new site' ),
				context: 'Adding a new website',
				callback: ( { close } ) => {
					close();
					navigate( createSiteUrl );
				},
				icon: addNewSiteIcon,
				separator: true,
			},
		];
	}, [ __, createSiteUrl, setSelectedCommandName ] );

	const selectedCommand = commands.find( ( c ) => c.name === selectedCommandName );
	let sitesToPick: Command[] | null = null;
	if ( selectedCommand?.siteFunctions ) {
		const { onClick, filter } = selectedCommand.siteFunctions;
		const filteredSites = filter ? allSites.filter( filter ) : allSites;
		sitesToPick = filteredSites.map( siteToAction( onClick ) );
	}

	return { commands: sitesToPick ?? commands };
};
