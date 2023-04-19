import { translate } from 'i18n-calypso';
import { trim } from 'lodash';
import AsyncLoad from 'calypso/components/async-load';
import {
	trackPageLoad,
	trackUpdatesLoaded,
	trackScrollPage,
	getStartDate,
} from 'calypso/reader/controller-helper';
import { TAG_PAGE } from 'calypso/reader/follow-sources';
import { recordTrack } from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

const analyticsPageTitle = 'Reader';

const renderHeaderSection = () => (
	<div className="tag-stream__page-header">
		<h2>
			{
				// translators: The title of the reader tag page
				translate( 'WordPress Reader' )
			}
		</h2>
		<h1>{ translate( 'Enjoy millions of blogs at your fingertips.' ) }</h1>
	</div>
);

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
			showPrimaryFollowButtonOnCards={ false }
			followSource={ TAG_PAGE }
		/>
	);
	next();
};
