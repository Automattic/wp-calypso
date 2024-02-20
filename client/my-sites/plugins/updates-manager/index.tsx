import { Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { PluginsUpdateManager } from 'calypso/blocks/plugins-update-manager';
import MainComponent from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';

export const UpdatesManager = () => {
	return (
		<MainComponent wideLayout>
			<NavigationHeader
				navigationItems={ [] }
				title="Plugin updates manager"
				subtitle="Effortlessly schedule plugin auto-updates with built-in rollback logic."
			>
				<Button __next40pxDefaultSize icon={ plus } variant="primary">
					Create a new schedule
				</Button>
			</NavigationHeader>

			<PluginsUpdateManager />
		</MainComponent>
	);
};
