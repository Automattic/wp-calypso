import {
	plus as addNewSiteIcon,
	globe as domainsIcon,
	commentAuthorAvatar as profileIcon,
} from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import MaterialIcon from 'calypso/components/material-icon';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { navigate } from 'calypso/lib/navigate';
import { useAddNewSiteUrl } from 'calypso/lib/paths/use-add-new-site-url';
import wpcom from 'calypso/lib/wp';
import { isCustomDomain, isNotAtomicJetpack } from '../utils';

export const useCommandsArrayWpcom = ( {
	setSelectedCommandName,
}: {
	setSelectedCommandName: ( actionName: string ) => void;
} ) => {
	const setStateCallback =
		( actionName: string ) =>
		( { setSearch }: { setSearch: ( search: string ) => void } ) => {
			setSearch( '' );
			setSelectedCommandName( actionName );
		};

	const { __ } = useI18n();
	const createSiteUrl = useAddNewSiteUrl( {
		source: 'sites-dashboard-command-palette',
		ref: 'topbar',
	} );

	const fetchSshUser = async ( siteId: number ) => {
		const response = await wpcom.req.get( {
			path: `/sites/${ siteId }/hosting/ssh-users`,
			apiNamespace: 'wpcom/v2',
		} );

		const sshUserResponse = response?.users;

		if ( ! sshUserResponse?.length ) {
			return null;
		}

		return sshUserResponse[ 0 ];
	};

	const copySshSftpDetails = async (
		siteId: number,
		copyType: 'username' | 'connectionString',
		siteSlug: string
	) => {
		const sshUser = await fetchSshUser( siteId );

		if ( ! sshUser ) {
			return navigate( `/hosting-config/${ siteSlug }` );
		}

		const textToCopy = copyType === 'username' ? sshUser : `ssh ${ sshUser }@sftp.wp.com`;
		navigator.clipboard.writeText( textToCopy );
	};

	const resetSshSftpPassword = async ( siteId: number, siteSlug: string ) => {
		const sshUser = await fetchSshUser( siteId );

		const response = await wpcom.req.post( {
			path: `/sites/${ siteId }/hosting/ssh-user/${ sshUser }/reset-password`,
			apiNamespace: 'wpcom/v2',
			body: {},
		} );

		const sshPassword = response?.password;

		if ( sshPassword !== null ) {
			navigator.clipboard.writeText( sshPassword );
		} else {
			navigate( `/hosting-config/${ siteSlug }` );
		}
	};

	const commands = [
		{
			name: 'addNewSite',
			label: __( 'Add New Site' ),
			searchLabel: __( 'add new site' ),
			context: 'Adding a new website',
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( createSiteUrl );
			},
			icon: addNewSiteIcon,
		},
		{
			name: 'openProfile',
			label: __( 'Open my profile' ),
			searchLabel: __( 'open my profile' ),
			context: 'Opening my profile',
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `/me` );
			},

			icon: profileIcon,
		},
		{
			name: 'openAccountSettings',
			label: __( 'Open account settings' ),
			searchLabel: __( 'open account settings' ),
			context: 'Openining account settings',
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `/me/account` );
			},
			icon: <MaterialIcon icon="settings" />,
		},
		{
			name: 'acessPurchases',
			label: __( 'Open my purchases' ),
			searchLabel: __( 'open my purchases' ),
			context: 'Openining my purchases',
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `me/purchases` );
			},
			icon: <MaterialIcon icon="credit_card" />,
		},
		{
			name: 'manageDomains',
			label: __( 'Manage Domains' ),
			searchLabel: __( 'manage domains' ),
			context: 'Managing domains',
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `domains/manage` );
			},
			icon: domainsIcon,
		},
		{
			name: 'manageDns',
			label: __( 'Manage DNS records' ),
			searchLabel: __( 'manage dns records' ),
			context: 'Managing DNS records',
			callback: setStateCallback( 'manageDns' ),
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
			name: 'copySshConnectionString',
			label: __( 'Copy SSH connection string' ),
			searchLabel: __( 'copy ssh connection string' ),
			context: 'Copying SSH connection string',
			callback: setStateCallback( 'copySshConnectionString' ),
			siteFunctions: {
				onClick: async ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					await copySshSftpDetails( site.ID, 'connectionString', site.slug );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: <MaterialIcon icon="key" />,
		},
		{
			name: 'openSshDetails',
			label: __( 'Open SSH details' ),
			searchLabel: __( 'open SSH details' ),
			context: 'Opening SSH details',
			callback: setStateCallback( 'openSshDetails' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/hosting-config/${ site.slug }` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: <MaterialIcon icon="key" />,
		},
		{
			name: 'resetSshSftpPassword',
			label: __( 'Reset SSH/SFTP password' ),
			searchLabel: __( 'reset ssh/sftp password' ),
			context: 'Resetting SSH/SFTP password',
			callback: setStateCallback( 'resetSshSftpPassword' ),
			siteFunctions: {
				onClick: async ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					resetSshSftpPassword( site.ID, site.slug );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: <MaterialIcon icon="key" />,
		},
	];

	return commands;
};
