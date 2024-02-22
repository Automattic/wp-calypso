import { Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { PluginsUpdateManager } from 'calypso/blocks/plugins-update-manager';
import { Create } from 'calypso/blocks/plugins-update-manager/create';
import MainComponent from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';

interface ListProps {
	siteSlug: string;
	onNavBack?: () => void;
	onCreateNewSchedule?: () => void;
}
export const UpdatesManager = ( props: ListProps ) => {
	const { onNavBack, onCreateNewSchedule } = props;

	return (
		<MainComponent wideLayout>
			<NavigationHeader
				navigationItems={ [] }
				title="Plugin updates manager"
				subtitle="Effortlessly schedule plugin auto-updates with built-in rollback logic."
			>
				{ onCreateNewSchedule && (
					<Button
						__next40pxDefaultSize
						icon={ plus }
						variant="primary"
						onClick={ onCreateNewSchedule }
					>
						Create a new schedule
					</Button>
				) }
			</NavigationHeader>

			<PluginsUpdateManager onNavBack={ onNavBack } />
		</MainComponent>
	);
};

interface CreateProps {
	siteSlug: string;
	onNavBack?: () => void;
}
export const UpdatesManagerCreate = ( props: CreateProps ) => {
	const { onNavBack } = props;

	return (
		<MainComponent wideLayout>
			<NavigationHeader
				navigationItems={ [] }
				title="Plugin updates manager"
				subtitle="Effortlessly schedule plugin auto-update with built-in rollback logic"
			></NavigationHeader>
			<Create onNavBack={ onNavBack } />
		</MainComponent>
	);
};
