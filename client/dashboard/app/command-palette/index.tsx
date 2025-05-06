// @ts-expect-error The commands package is not yet typed.
import { CommandMenu, useCommandLoader } from '@wordpress/commands';
import { useNavigationCommandLoader } from './commands';

function DashboardCommandPalette() {
	useCommandLoader( {
		name: 'dashboard/navigation',
		hook: useNavigationCommandLoader,
		context: 'root',
	} );

	return <CommandMenu search="" />;
}

export default DashboardCommandPalette;
