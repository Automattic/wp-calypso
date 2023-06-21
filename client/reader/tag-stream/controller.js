import { trim } from 'lodash';
import AsyncLoad from 'calypso/components/async-load';
import {
	trackPageLoad,
	trackUpdatesLoaded,
	trackScrollPage,
	getStartDate,
} from 'calypso/reader/controller-helper';
import { recordTrack } from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import renderHeaderSection from '../lib/header-section';

const analyticsPageTitle = 'Reader';

export const tagListing = ( context, next ) => {
	const basePath = '/tag/:slug';
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > Tag > ' + context.params.tag;
	const tagSlug = trim( context.params.tag )
		.toLowerCase()
		.replace( /\s+/g, '-' )
		.replace( /-{2,}/g, '-' );
	const encodedTag = encodeURIComponent( tagSlug ).toLowerCase();
	const streamKey = 'tag:' + tagSlug;
	const mcKey = 'topic';
	const startDate = getStartDate( context );

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_tag_loaded', {
		tag: tagSlug,
	} );

	if ( ! isUserLoggedIn( context.store.getState() ) ) {
		context.headerSection = renderHeaderSection();
	}
	context.primary = (
		<AsyncLoad
			require="calypso/reader/tag-stream/main"
			key={ 'tag-' + encodedTag }
			streamKey={ streamKey }
			encodedTagSlug={ encodedTag }
			decodedTagSlug={ tagSlug }
			trackScrollPage={ trackScrollPage.bind(
				// eslint-disable-line
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			) }
			startDate={ startDate }
			onUpdatesShown={ trackUpdatesLoaded.bind( null, mcKey ) } // eslint-disable-line
			showBack={ !! context.lastRoute }
		/>
	);
	next();
};
