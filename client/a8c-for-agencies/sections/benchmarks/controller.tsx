import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import LearnSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/learn';
import BenchmarksOverview from './primary/benchmarks-overview';

export const benchmarksContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Resources and tools > Benchmarks" path={ context.path } />
			<BenchmarksOverview />
		</>
	);
	context.secondary = <LearnSidebar path={ context.path } />;
	next();
};
