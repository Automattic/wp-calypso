import config from '@automattic/calypso-config';
import AsyncLoad from 'calypso/components/async-load';
import LoadStatsPage from '../../stats-redirect/load-stats-page';
import PageLoading from '../shared/page-loading';
import type { Context } from '@automattic/calypso-router';

const isBuilderEnabled = config.isEnabled( 'stats/utm-builder' );

function utmBuilder( context: Context, next: () => void ) {
	context.primary = isBuilderEnabled ? (
		<LoadStatsPage>
			<AsyncLoad require="calypso/my-sites/stats/pages/utm-builder" placeholder={ PageLoading } />
		</LoadStatsPage>
	) : (
		<>This page is not available.</>
	);

	next();
}

export default utmBuilder;
