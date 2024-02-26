import { home as dashboardIcon, wordpress as wordpressIcon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { Command } from '../use-command-palette';
import { useCommandsParams } from './types';
import useCommandNavigation from './use-command-navigation';

const useAtomicLimitedCommands = ( { navigate, currentRoute }: useCommandsParams ) => {
	const { __, _x } = useI18n();
	const commandNavigation = useCommandNavigation( { navigate, currentRoute } );

	const viewMySitesCommand: Command = {
		name: 'viewMySites',
		label: __( 'View my sites', __i18n_text_domain__ ),
		searchLabel: [
			_x( 'view my sites', 'Keyword for the View my sites command', __i18n_text_domain__ ),
			_x( 'manage sites', 'Keyword for the View my sites command', __i18n_text_domain__ ),
			_x( 'sites dashboard', 'Keyword for the View my sites command', __i18n_text_domain__ ),
		].join( ' ' ),
		callback: commandNavigation( `https://wordpress.com/sites` ),
		icon: wordpressIcon,
	};

	const openDashboardCommand: Command = {
		name: 'openSiteDashboard',
		label: __( 'Open site dashboard', __i18n_text_domain__ ),
		searchLabel: [
			_x(
				'open site dashboard',
				'Keyword for the Open site dashboard command',
				__i18n_text_domain__
			),
			_x( 'admin', 'Keyword for the Open site dashboard command', __i18n_text_domain__ ),
			_x( 'wp-admin', 'Keyword for the Open site dashboard command', __i18n_text_domain__ ),
		].join( ' ' ),
		context: [ '/sites' ],
		callback: commandNavigation( `/wp-admin` ),
		icon: dashboardIcon,
	};

	return [ viewMySitesCommand, openDashboardCommand ];
};

export default useAtomicLimitedCommands;
