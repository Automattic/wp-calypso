import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import AsyncLoad from 'calypso/components/async-load';
import { getCurrentTabFromURL } from 'calypso/reader/utils';
import { ATMOSPHERE_PREFIX, DEFAULT_ATMOSPHERE_TAB } from './helper';

export function atmosphereController( context: Context, next: () => void ) {
	if ( ! isEnabled( 'reader/atmosphere' ) ) {
		page.redirect( '/reader' );
		return;
	}
	const selectedTab = getCurrentTabFromURL(
		context.path,
		ATMOSPHERE_PREFIX,
		DEFAULT_ATMOSPHERE_TAB
	);
	context.primary = (
		<AsyncLoad require="calypso/reader/atmosphere/atmosphere-view" selectedTab={ selectedTab } />
	);
	next();
}
