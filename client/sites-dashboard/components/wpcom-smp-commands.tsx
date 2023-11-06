import {
	plus as addNewSiteIcon,
	globe as domainsIcon,
	commentAuthorAvatar as profileIcon,
} from '@wordpress/icons';
import MaterialIcon from 'calypso/components/material-icon';
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
		{
			name: 'openProfile',
			label: __( 'Open my profile' ),
			searchLabel: __( 'profile' ),
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
			searchLabel: __( 'account' ),
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
			searchLabel: __( 'puchases' ),
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
			searchLabel: __( 'manage dns' ),
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
	];

	return commands;
};
