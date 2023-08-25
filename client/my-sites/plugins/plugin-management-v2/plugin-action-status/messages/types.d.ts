import { PLUGIN_INSTALLATION_UP_TO_DATE } from 'calypso/state/plugins/installed/status/constants';
import { PluginActionStatus } from '../../types';
import type { translate, TranslateResult } from 'i18n-calypso';

export type PluginActionStatusForMessages =
	| PluginActionStatus
	| typeof PLUGIN_INSTALLATION_UP_TO_DATE;

export type TranslateFn = typeof translate;
export type TranslatableMessageGetter = ( props: {
	hasSelectedSite: boolean;
	siteCount: number;
} ) => ( translate: TranslateFn ) => TranslateResult;

export type PluginActionMessagesByStatus = Partial<
	Record< PluginActionStatusForMessages, TranslatableMessageGetter >
>;
