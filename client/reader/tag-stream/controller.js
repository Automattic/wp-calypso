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
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import renderHeaderSection from '../lib/header-section';

const analyticsPageTitle = 'Reader';

export const tagListing = ( context, next ) => {
	const basePath = '/tag/:slug';
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > Tag > ' + context.params.tag;
	const tagSlug = decodeURIComponent(
		trim( context.params.tag ).toLowerCase().replace( /\s+/g, '-' ).replace( /-{2,}/g, '-' )
	);
	const tagTitle = titlecase( trim( context.params.tag ) ).replace( /[-_]/g, ' ' );
	const state = context.store.getState();

	const encodedTag = encodeURIComponent( tagSlug ).toLowerCase();

	// default to tags by recency unless the user explicitly selects 'relavance'
	const streamKey =
		context.query.sort === 'relevance' ? 'tag_popular:' + tagSlug : 'tag:' + tagSlug;

	const mcKey = 'topic';
	const startDate = getStartDate( context );

	const currentRoute = getCurrentRoute( state );
	const currentQueryArgs = new URLSearchParams( getCurrentQueryArguments( state ) ).toString();

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack(
		'calypso_reader_tag_loaded',
		{
			tag: tagSlug,
		},
		{ pathnameOverride: `${ currentRoute }?${ currentQueryArgs }` }
	);

	if ( ! isUserLoggedIn( state ) ) {
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
				sort={ context.query.sort }
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
			/>
		</>
	);
	next();
};
