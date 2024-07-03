import config from '@automattic/calypso-config';
import page, { Context } from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
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

export const notFound = ( context: Context, next: () => void ) => {
	if ( ! config.isEnabled( 'start-with/square-payments' ) ) {
		page.redirect( '/' );
		return;
	}

	context.primary = (
		<EmptyContent
			className="content-404"
			illustration="/calypso/images/illustrations/illustration-404.svg"
			title={ translate( 'Uh oh. Page not found.' ) }
			line={ translate( "Sorry, the page you were looking for doesn't exist or has been moved." ) }
			action={ translate( 'Return Home' ) }
			actionURL="/"
		/>
	);

	next();
};
