import {
	plus as addNewSiteIcon,
	globe as domainsIcon,
	commentAuthorAvatar as profileIcon,
} from '@wordpress/icons';
import MaterialIcon from 'calypso/components/material-icon';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { navigate } from 'calypso/lib/navigate';
import { SFTP_PORT, SFTP_URL } from 'calypso/my-sites/hosting/sftp-card';
import { useSelector } from 'calypso/state';
import { getAtomicHosting } from 'calypso/state/selectors/get-atomic-hosting';
import { isCustomDomain, isNotAtomicJetpack } from '../utils';

export const useCommandsArrayWpcom = ( {
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

	const AtomicHosting = useSelector( ( state ) => getAtomicHosting( state ) );

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
			name: 'copySshSftpPort',
			label: __( 'Copy SSH/SFTP port' ),
			searchLabel: __( 'copy ssh/sftp port' ),
			context: 'Copying SSH/SFTP port',
			callback: ( { close }: { close: () => void } ) => {
				close();
				const portSFTP = SFTP_PORT.toString();
				navigator.clipboard.writeText( portSFTP );
			},
		},
		{
			name: 'copySshSftpURL',
			label: __( 'Copy SSH/SFTP URL' ),
			searchLabel: __( 'copy ssh/sftp url' ),
			context: 'Copying SSH/SFTP URL',
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigator.clipboard.writeText( SFTP_URL );
			},
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

					const SFTPUsers = AtomicHosting?.[ site.ID ]?.sftpUsers;
					console.log( site.ID, AtomicHosting );
					console.log( AtomicHosting?.[ site.ID ] );
					console.log( SFTPUsers );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
		},
	];

	return commands;
};
