import config from '@automattic/calypso-config';
import { Dialog } from './dialog';

export function goldenTicketContext( context: PageJS.Context, next: () => void ): void {
	if ( ! config.isEnabled( 'jetpack/golden-ticket' ) ) {
		page.redirect( '/' );
	}

	context.primary = <Dialog />;
	next();
}
