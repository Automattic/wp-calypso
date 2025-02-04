import config from '@automattic/calypso-config';
import page, { type Callback } from '@automattic/calypso-router';
import { GoldenTokenDialog } from './golden-token-dialog';

export const goldenTokenContext: Callback = ( context, next ) => {
	if ( ! config.isEnabled( 'jetpack/golden-token' ) ) {
		page.redirect( '/' );
	}

	context.primary = <GoldenTokenDialog />;
	next();
};
