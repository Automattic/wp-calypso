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
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { navigate } from 'calypso/lib/navigate';
import { isCustomDomain, isNotAtomicJetpack } from '../utils';

export const generateCommandsArrayWpcom = ( {
	setSelectedCommandName,
	createSiteUrl,
	__,
}: {
	setSelectedCommandName: ( actionName: string ) => void;
	createSiteUrl: string;
	__: ( text: string ) => string;
} ) => {
	const setStateCallback =
		( actionName: string ) =>
		( { setSearch }: { setSearch: ( search: string ) => void } ) => {
			setSearch( '' );
			setSelectedCommandName( actionName );
		};

	const commands = [
		{
			name: 'ssh',
			label: __( 'SSH' ),
			searchLabel: __( 'ssh' ),
			context: 'Accessing via SSH',
			callback: setStateCallback( 'ssh' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/hosting-config/${ site.slug }#sftp-credentials` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/domains/manage/${ site.slug }/dns/${ site.slug }` );
				},
				filter: ( site: SiteExcerptData ) =>
					isCustomDomain( site.slug ) && ! isNotAtomicJetpack( site ),
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/hosting-config/${ site.slug }` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/settings/general/${ site.slug }#site-privacy-settings` );
				},
				filter: ( site: SiteExcerptData ) => site?.launch_status === 'unlaunched',
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
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
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( createSiteUrl );
			},
			icon: addNewSiteIcon,
		},
	];

	return commands;
};
