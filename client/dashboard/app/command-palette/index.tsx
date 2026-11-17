import { CommandMenu, useCommandLoader } from '@wordpress/commands';
import { useNavigationCommandLoader } from './commands';

function DashboardCommandPalette() {
	useCommandLoader( {
		name: 'dashboard/navigation',
		hook: useNavigationCommandLoader,
		context: 'root',
	} );

	return <CommandMenu />;
}

export default DashboardCommandPalette;
