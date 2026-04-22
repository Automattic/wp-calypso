import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import AsyncLoad from 'calypso/components/async-load';

export function atmosphereController( context: PageJS.Context, next: () => void ) {
	if ( ! isEnabled( 'reader/atmosphere' ) ) {
		page.redirect( '/reader' );
		return;
	}
	context.primary = <AsyncLoad require="calypso/reader/atmosphere/atmosphere-view" />;
	next();
}
