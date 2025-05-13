import { Context } from '@automattic/calypso-router';
import { UniversalNavbarFooter, UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import { translate, fixMe } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import { getLoginUrl } from 'calypso/landing/stepper/utils/path';
import { WeeklyReportUnsubscribe } from 'calypso/performance-profiler/pages/weekly-report/unsubscribe';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { TabTypes } from './components/header';
import { PerformanceProfilerDashboardWrapper } from './pages/dashboard';
import { WeeklyReport } from './pages/weekly-report';

import './style.scss';

export function PerformanceProfilerWrapper( {
	children,
	isLoggedIn,
}: {
	children: React.ReactNode;
	isLoggedIn: boolean;
} ): JSX.Element {
	return (
		<>
			{ isLoggedIn && <UniversalNavbarHeader isLoggedIn /> }
			<Main fullWidthLayout>{ children }</Main>
			<UniversalNavbarFooter isLoggedIn={ isLoggedIn } />
		</>
	);
}

export function PerformanceProfilerDashboardContext( context: Context, next: () => void ): void {
	const isLoggedIn = isUserLoggedIn( context.store.getState() );

	if ( ! context.query?.url ) {
		window.location.href = '/speed-test/';
		return;
	}

	const url = context.query.url.startsWith( 'http' )
		? context.query.url
		: `https://${ context.query.url }`;

	context.primary = (
		<PerformanceProfilerWrapper isLoggedIn={ isLoggedIn }>
			<PerformanceProfilerDashboardWrapper
				url={ url }
				tab={
					[ TabTypes.mobile, TabTypes.desktop ].indexOf( context.query?.tab ) !== -1
						? context.query?.tab
						: TabTypes.mobile
				}
				hash={ context.query?.hash ?? '' }
				filter={ context.query?.filter }
			/>
		</PerformanceProfilerWrapper>
	);

	next();
}

export function WeeklyReportContext( context: Context, next: () => void ): void {
	const isLoggedIn = isUserLoggedIn( context.store.getState() );

	if ( ! isLoggedIn ) {
		const logInUrl = getLoginUrl( {
			variationName: 'performance-profiler-weekly-report-subscribe',
			redirectTo: `${ window.location.protocol }//${ window.location.host }${ context.path }`,
			locale: getCurrentLocaleSlug( context.store.getState() ),
		} );

		window.location.href = logInUrl;
		return;
	}

	const url = context.query?.url?.startsWith( 'http' )
		? context.query.url
		: `https://${ context.query?.url ?? '' }`;

	context.primary = (
		<PerformanceProfilerWrapper isLoggedIn={ isLoggedIn }>
			<WeeklyReport url={ url } hash={ context.query?.hash ?? '' } />
		</PerformanceProfilerWrapper>
	);

	next();
}

export function WeeklyReportUnsubscribeContext( context: Context, next: () => void ): void {
	const isLoggedIn = isUserLoggedIn( context.store.getState() );

	const url = context.query?.url?.startsWith( 'http' )
		? context.query.url
		: `https://${ context.query?.url ?? '' }`;

	context.primary = (
		<PerformanceProfilerWrapper isLoggedIn={ isLoggedIn }>
			<WeeklyReportUnsubscribe url={ url } hash={ context.query?.hash ?? '' } />
		</PerformanceProfilerWrapper>
	);

	next();
}

export const notFound = ( context: Context, next: () => void ) => {
	context.primary = (
		<EmptyContent
			className="content-404"
			title={ fixMe( {
				text: 'Page not found.',
				newCopy: translate( 'Page not found.' ),
				oldCopy: translate( 'Uh oh. Page not Found.' ),
			} ) }
			line={ translate( 'Sorry, the page you were looking for doesn‘t exist or has been moved.' ) }
			action={ translate( 'Return Home' ) }
			actionURL="/"
		/>
	);

	next();
};
