import { useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import {
	globe,
	commentAuthorAvatar,
	envelope,
	bell,
	wordpress,
	plugins,
	cog,
	payment,
	receipt,
	lock,
} from '@wordpress/icons';
import { useAppContext } from '../context';
import type { AppConfig } from '../context';

type Supports = AppConfig[ 'supports' ];

export interface Command {
	name: string;
	label: string;
	searchLabel: string;
	path: string;
	icon: React.ReactNode;
	// Optional predicate that controls when the command is available, based on
	// the app's supported features. Omit to always show the command.
	isEnabled?: ( supports: Supports ) => boolean;
}

export const navigationCommands: Command[] = [
	{
		name: 'dashboard-go-to-sites',
		label: __( 'Go to Sites' ),
		searchLabel: __( 'Navigate to Sites dashboard Sites page' ),
		path: '/sites',
		icon: wordpress,
		isEnabled: ( supports ) => supports.sites,
	},
	{
		name: 'dashboard-go-to-domains',
		label: __( 'Go to Domains' ),
		searchLabel: __( 'Navigate to Domain management Domains list' ),
		path: '/domains',
		icon: globe,
		isEnabled: ( supports ) => supports.domains,
	},
	{
		name: 'dashboard-go-to-emails',
		label: __( 'Go to Emails' ),
		searchLabel: __( 'Navigate to Email management Email inbox' ),
		path: '/emails',
		icon: envelope,
		isEnabled: ( supports ) => supports.emails,
	},
	{
		name: 'dashboard-go-to-plugins',
		label: __( 'Go to Plugins' ),
		searchLabel: __( 'Navigate to Plugins management install plugins' ),
		path: '/plugins',
		icon: plugins,
		isEnabled: ( supports ) => supports.plugins,
	},
	{
		name: 'dashboard-go-to-account',
		label: __( 'Go to Account' ),
		searchLabel: __( 'Navigate to User account profile settings' ),
		path: '/me/account',
		icon: commentAuthorAvatar,
		isEnabled: ( supports ) => !! supports.me,
	},
	{
		name: 'dashboard-go-to-preferences',
		label: __( 'Go to Preferences' ),
		searchLabel: __( 'Navigate to account preferences settings appearance language' ),
		path: '/me/preferences',
		icon: cog,
		isEnabled: ( supports ) => !! supports.me,
	},
	{
		name: 'dashboard-go-to-billing',
		label: __( 'Go to Billing' ),
		searchLabel: __( 'Navigate to billing payment methods active subscriptions' ),
		path: '/me/billing',
		icon: payment,
		isEnabled: ( supports ) => !! ( supports.me && supports.me.billing ),
	},
	{
		name: 'dashboard-go-to-purchases',
		label: __( 'Go to Purchases' ),
		searchLabel: __( 'Navigate to purchases receipts billing history' ),
		path: '/me/billing/purchases',
		icon: receipt,
		isEnabled: ( supports ) => !! ( supports.me && supports.me.billing ),
	},
	{
		name: 'dashboard-go-to-security',
		label: __( 'Go to Security' ),
		searchLabel: __( 'Navigate to account security password two-step authentication' ),
		path: '/me/security',
		icon: lock,
		isEnabled: ( supports ) => !! ( supports.me && supports.me.security ),
	},
	{
		name: 'dashboard-go-to-notifications',
		label: __( 'Go to Notifications' ),
		searchLabel: __( 'Check your WordPress notifications alerts' ),
		path: '/me/notifications',
		icon: bell,
		isEnabled: ( supports ) => supports.notifications,
	},
];

/**
 * Navigation command loader based on app context and feature flags
 */
export function useNavigationCommandLoader() {
	const router = useRouter();
	const { supports } = useAppContext();

	// Filter commands based on the app's supported features.
	const enabledCommands = navigationCommands.filter(
		( cmd ) => ! cmd.isEnabled || cmd.isEnabled( supports )
	);

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
