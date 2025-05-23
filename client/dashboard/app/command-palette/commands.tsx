import { useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { globe, commentAuthorAvatar, envelope, bell, wordpress, home } from '@wordpress/icons';
import { useAppContext } from '../context';
import type { AppConfig } from '../context';

export interface Command {
	name: string;
	label: string;
	searchLabel: string;
	path: string;
	icon: React.ReactNode;
	// Optional feature flag that controls when command is available
	feature?: keyof AppConfig[ 'supports' ];
}

export const navigationCommands: Command[] = [
	{
		name: 'dashboard-go-to-overview',
		label: __( 'Go to Overview' ),
		searchLabel: __( 'Navigate to Dashboard Overview page' ),
		path: '/overview',
		icon: home,
		feature: 'overview',
	},
	{
		name: 'dashboard-go-to-sites',
		label: __( 'Go to Sites' ),
		searchLabel: __( 'Navigate to Sites dashboard Sites page' ),
		path: '/sites',
		icon: wordpress,
		feature: 'sites',
	},
	{
		name: 'dashboard-go-to-emails',
		label: __( 'Go to Emails' ),
		searchLabel: __( 'Navigate to Email management Email inbox' ),
		path: '/emails',
		icon: envelope,
		feature: 'emails',
	},
	{
		name: 'dashboard-go-to-domains',
		label: __( 'Go to Domains' ),
		searchLabel: __( 'Navigate to Domain management Domains list' ),
		path: '/domains',
		icon: globe,
		feature: 'domains',
	},
	{
		name: 'dashboard-go-to-profile',
		label: __( 'Go to Profile' ),
		searchLabel: __( 'Navigate to User profile settings account' ),
		path: '/me/profile',
		icon: commentAuthorAvatar,
		feature: 'me',
	},
	{
		name: 'dashboard-go-to-notifications',
		label: __( 'Go to Notifications' ),
		searchLabel: __( 'Check your WordPress notifications alerts' ),
		path: '/me/notifications',
		icon: bell,
		feature: 'notifications',
	},
];

/**
 * Navigation command loader based on app context and feature flags
 */
export function useNavigationCommandLoader() {
	const router = useRouter();
	const { supports } = useAppContext();

	// Filter commands based on feature flags from app context
	const enabledCommands = navigationCommands.filter( ( cmd ) => {
		if ( ! cmd.feature ) {
			return true;
		}
		return supports[ cmd.feature ];
	} );

	return {
		commands: enabledCommands.map( ( cmd ) => ( {
			name: cmd.name,
			label: cmd.label,
			searchLabel: cmd.searchLabel,
			callback: ( { close }: { close: () => void } ) => {
				router.navigate( {
					to: cmd.path,
				} );
				close();
			},
			icon: cmd.icon,
		} ) ),
		isLoading: false,
	};
}
