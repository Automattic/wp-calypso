import { translate } from 'i18n-calypso';
import { PluginFilter } from 'calypso/state/plugins/installed/types';

export const pluginsEmptyMessage: { [ key in PluginFilter ]?: string } = {
	all: translate( 'No plugins found.' ),
	active: translate( 'No plugins are active.' ),
	inactive: translate( 'No plugins are inactive.' ),
	updates: translate( 'All plugins are up to date.' ),
};
