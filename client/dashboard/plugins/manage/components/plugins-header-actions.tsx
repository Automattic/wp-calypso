import { Button, __experimentalText as Text } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

type PluginsHeaderActionsProps = {
	updateCount: number;
	onFilterUpdates: () => void;
	/**
	 * Whether the header is rendered in the "sites with this plugin" dataview.
	 * When true, we use a singular "Plugin up to date" message instead of
	 * the default plural wording.
	 */
	isSitesWithThisPluginView?: boolean;
};

export const PluginsHeaderActions = ( {
	updateCount,
	onFilterUpdates,
	isSitesWithThisPluginView = false,
}: PluginsHeaderActionsProps ) => {
	const hasUpdates = updateCount > 0;

	const renderText = () => {
		if ( hasUpdates ) {
			return sprintf(
				// translators: %d is the number of plugins with an update available.
				__( 'Updates available (%d)' ),
				updateCount
			);
		}

		return isSitesWithThisPluginView ? __( 'Plugin up to date' ) : __( 'Plugins up to date' );
	};

	return (
		<Button variant="tertiary" size="compact" disabled={ ! hasUpdates } onClick={ onFilterUpdates }>
			<Text>{ renderText() }</Text>
		</Button>
	);
};
