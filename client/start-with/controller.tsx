import config from '@automattic/calypso-config';
import page, { Context } from '@automattic/calypso-router';
import Main from 'calypso/components/main';
import { StartWithSquarePayments } from './square-payments';

export function startWithSquarePaymentsContext( context: Context, next: () => void ): void {
	if ( ! config.isEnabled( 'start-with/square-payments' ) ) {
		page.redirect( '/' );
		return;
	}

	context.primary = (
		<Main fullWidthLayout>
			<StartWithSquarePayments />
		</Main>
	);

	next();
}

export function redirectToSquarePayments(): void {
	page.redirect( '/start-with/square-payments' );
	return;
}
