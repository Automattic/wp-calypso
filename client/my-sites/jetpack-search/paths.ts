/**
 * Internal dependencies
 */
import { addQueryArgs } from 'calypso/lib/url';

export const jetpackSearchMainPath = ( siteName?: string | null, query = {} ) =>
	siteName ? addQueryArgs( query, `/jetpack-search/${ siteName }` ) : '/jetpack-search';
