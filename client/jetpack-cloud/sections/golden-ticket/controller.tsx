import config from '@automattic/calypso-config';
import { GoldenTicketDialog } from './golden-ticket-dialog';

export function goldenTicketContext( context: PageJS.Context, next: () => void ): void {
	if ( ! config.isEnabled( 'jetpack/golden-ticket' ) ) {
		page.redirect( '/' );
	}

	context.primary = <GoldenTicketDialog />;
	next();
}
