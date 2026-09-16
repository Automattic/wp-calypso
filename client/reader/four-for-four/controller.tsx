import i18n from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import { sectionify } from 'calypso/lib/route';
import StreamComponent from 'calypso/reader/following/main';
import { recordTrack } from 'calypso/reader/stats';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import {
	trackPageLoad,
	trackScrollPage,
	trackUpdatesLoaded,
	setPageTitle,
} from '../controller-helper';
import { FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX } from './constants';
import type { Context } from '@automattic/calypso-router';

const loadModal = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-four-for-four" */ 'calypso/reader/four-for-four'
	).then( ( module ) => ( { default: module.FourForFour } ) );

const analyticsPageTitle = 'Reader';

/**
 * Renders the following stream with the 4 for 4 modal over it, so closing the
 * modal leaves the writer in the Reader.
 */
export function fourForFour( context: Context, next: () => void ) {
	const basePath = sectionify( context.path );
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > 4 for 4';
	const mcKey = 'four-for-four';

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

	recordTrack(
		`${ FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX }loaded`,
		{ source: context.query?.source ?? '' },
		{ pathnameOverride: getCurrentRoute( context.store.getState() ) }
	);

	setPageTitle( context, i18n.translate( '4 for 4' ) );

	context.primary = (
		<>
			<StreamComponent
				key="following"
				listName={ i18n.translate( 'Followed Sites' ) }
				streamKey="following"
				recsStreamKey="custom_recs_posts_with_images"
				trackScrollPage={ trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				) }
				onUpdatesShown={ trackUpdatesLoaded.bind( null, 'following' ) }
				suppressReaderOnboarding
			/>
			<AsyncLoad require={ loadModal } placeholder={ null } />
		</>
	);
	next();
}
