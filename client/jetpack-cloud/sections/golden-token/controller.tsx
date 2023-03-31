import config from '@automattic/calypso-config';
import { GoldenTokenDialog } from './golden-token-dialog';

export function goldenTokenContext( context: PageJS.Context, next: () => void ): void {
	if ( ! config.isEnabled( 'jetpack/golden-token' ) ) {
		page.redirect( '/' );
	}

	context.primary = <GoldenTokenDialog />;
	next();
}
