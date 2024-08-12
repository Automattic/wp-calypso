import config from '@automattic/calypso-config';
import page, { Context } from '@automattic/calypso-router';
import { UniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import { translate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { PerformanceProfilerDashboard } from './pages/dashboard';

export function PerformanceProfilerDashboardContext( context: Context, next: () => void ): void {
	const isLoggedIn = isUserLoggedIn( context.store.getState() );

	if ( ! config.isEnabled( 'performance-profiler' ) ) {
		page.redirect( '/' );
		return;
	}

	context.primary = (
		<>
			<Main fullWidthLayout>
				<PerformanceProfilerDashboard
					url={ context.query?.url ?? '' }
					tab={ context.query?.tab ?? '' }
				/>
			</Main>

			<UniversalNavbarFooter isLoggedIn={ isLoggedIn } />
		</>
	);

	next();
}

export const notFound = ( context: Context, next: () => void ) => {
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
