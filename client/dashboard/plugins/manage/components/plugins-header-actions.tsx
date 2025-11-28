import { __experimentalText as Text } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import './plugins-header-actions.scss';

type PluginsHeaderActionsProps = {
	updateCount: number;
	onFilterUpdates: () => void;
};

export const PluginsHeaderActions = ( {
	updateCount,
	onFilterUpdates,
}: PluginsHeaderActionsProps ) => {
	const hasUpdates = updateCount > 0;

	if ( hasUpdates ) {
		return (
			<Text onClick={ onFilterUpdates } className="plugins-header-actions__updates-link">
				{ sprintf(
					// translators: %d is the number of plugins with an update available.
					__( 'Updates available (%d)' ),
					updateCount
				) }
			</Text>
		);
	}

	return <Text>{ __( 'Plugins up to date' ) }</Text>;
};
