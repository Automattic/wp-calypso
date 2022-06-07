import { addQueryArgs } from 'calypso/lib/url';

export const jetpackCloneSettingsMainPath = ( siteName?: string | null, query = {} ) =>
	siteName
		? addQueryArgs( query, `/jetpack-clone-settings/${ siteName }` )
		: '/jetpack-clone-settings';
