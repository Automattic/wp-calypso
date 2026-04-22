import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import AsyncLoad from 'calypso/components/async-load';

export function atmosphereController( context: Context, next: () => void ) {
	if ( ! isEnabled( 'reader/atmosphere' ) ) {
		page.redirect( '/reader' );
		return;
	}
	context.primary = <AsyncLoad require="calypso/reader/atmosphere/atmosphere-view" />;
	next();
}
