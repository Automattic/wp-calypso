import { isEnabled } from '@automattic/calypso-config';
import page, { type Callback } from '@automattic/calypso-router';

export const redirectToOverviewContext: Callback = () => {
	const isA4AEnabled = isEnabled( 'a8c-for-agencies' );
	if ( isA4AEnabled ) {
		page( '/overview' );
		return;
	}
	window.location.href = 'https://automattic.com/for/agencies';
	return;
};
