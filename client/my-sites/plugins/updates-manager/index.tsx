import { PluginsUpdateManager } from 'calypso/blocks/plugins-update-manager';
import MainComponent from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';

export const UpdatesManager = () => {
	return (
		<MainComponent wideLayout>
			<NavigationHeader
				className="stats__section-header modernized-header"
				title="Plugin updates manager"
				subtitle="Effortlessly schedule plugin auto-updates with built-in rollback logic."
				navigationItems={ [] }
			></NavigationHeader>

			<PluginsUpdateManager />
		</MainComponent>
	);
};
