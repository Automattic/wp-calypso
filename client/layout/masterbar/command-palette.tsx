import page from '@automattic/calypso-router';
// @ts-expect-error The commands package is not yet typed.
import { CommandMenu, useCommandLoader } from '@wordpress/commands';
import { navigationCommands } from 'calypso/dashboard/app/command-palette/commands';

import '@wordpress/commands/build-style/style.css';

// Calypso and the dashboard don't share an information architecture, so the
// shared command definitions are mapped onto their Calypso routes here.
// Commands without a Calypso equivalent (e.g. Preferences) are left out.
const CALYPSO_COMMAND_PATHS: Record< string, string > = {
	'dashboard-go-to-sites': '/sites',
	'dashboard-go-to-domains': '/domains/manage',
	'dashboard-go-to-emails': '/email',
	'dashboard-go-to-plugins': '/plugins',
	'dashboard-go-to-account': '/me/account',
	'dashboard-go-to-billing': '/me/billing',
	'dashboard-go-to-purchases': '/me/purchases',
	'dashboard-go-to-security': '/me/security',
	'dashboard-go-to-notifications': '/me/notifications',
};

function useNavigationCommandLoader() {
	return {
		commands: navigationCommands
			.filter( ( command ) => CALYPSO_COMMAND_PATHS[ command.name ] )
			.map( ( command ) => ( {
				name: command.name,
				label: command.label,
				searchLabel: command.searchLabel,
				icon: command.icon,
				callback: ( { close }: { close: () => void } ) => {
					close();
					page( CALYPSO_COMMAND_PATHS[ command.name ] );
				},
			} ) ),
		isLoading: false,
	};
}

export default function CommandPalette() {
	useCommandLoader( {
		name: 'calypso/navigation',
		hook: useNavigationCommandLoader,
		context: 'root',
	} );

	return <CommandMenu search="" />;
}
