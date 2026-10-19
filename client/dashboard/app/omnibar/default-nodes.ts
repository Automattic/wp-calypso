import { __ } from '@wordpress/i18n';
import type { AdminBarNode } from '@automattic/omnibar';

// TODO: Remove once the admin-bar endpoint returns these nodes on all sites.
const getDefaultTopSecondaryNodes = (): AdminBarNode[] => [
	{
		id: 'reader',
		title: __( 'Reader' ),
		parent: 'top-secondary',
		href: 'https://wordpress.com/reader',
		group: false,
	},
	{
		id: 'help-center',
		title: __( 'Help' ),
		parent: 'top-secondary',
		href: 'https://my.wordpress.com/sites?help-center=home',
		group: false,
		meta: {
			icon: 'help',
		},
	},
	{
		id: 'notes',
		title: __( 'Notifications' ),
		parent: 'top-secondary',
		href: 'https://wordpress.com/reader/notifications',
		group: false,
	},
];

export function addMissingDefaultNodes( adminBarNodes: AdminBarNode[] ): AdminBarNode[] {
	const ids = new Set( adminBarNodes.map( ( node ) => node.id ) );
	const missingNodes = getDefaultTopSecondaryNodes().filter( ( node ) => ! ids.has( node.id ) );
	return missingNodes.length > 0 ? [ ...adminBarNodes, ...missingNodes ] : adminBarNodes;
}
