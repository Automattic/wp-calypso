import { translate } from 'i18n-calypso';
import { trim } from 'lodash';
import titlecase from 'to-title-case';
import AsyncLoad from 'calypso/components/async-load';
import DocumentHead from 'calypso/components/data/document-head';
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
	const tagTitle = titlecase( trim( context.params.tag ) ).replace( /[-_]/g, ' ' );

	const encodedTag = encodeURIComponent( tagSlug ).toLowerCase();
	const streamKey = 'tag:' + tagSlug;
	const mcKey = 'topic';
	const startDate = getStartDate( context );

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_tag_loaded', {
		tag: tagSlug,
	} );

	if ( ! isUserLoggedIn( context.store.getState() ) ) {
		context.renderHeaderSection = renderHeaderSection;
	}
	context.primary = (
		<>
			<DocumentHead
				title={ translate( 'Articles & Posts About %s ‹ Reader', {
					args: [ tagTitle ],
					comment: 'page title for reader tag pages. %s is the name of the tag e.g. "art"',
				} ) }
			/>
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
		</>
	);
	next();
};
