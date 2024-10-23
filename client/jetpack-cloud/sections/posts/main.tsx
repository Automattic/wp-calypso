import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import PostTypeFilter from 'calypso/my-sites/post-type-filter';
import PostTypeList from 'calypso/my-sites/post-type-list';

const PostsMain = ( { author, category, search, siteId, statusSlug, tag } ) => {
	const translate = useTranslate();
	const isAllSites = siteId ? 1 : 0;
	const query = {
		author,
		category,
		number: 20, // max supported by /me/posts endpoint for all-sites mode
		order: status === 'future' ? 'ASC' : 'DESC',
		search,
		site_visibility: ! siteId ? 'visible' : undefined,
		// When searching, search across all statuses so the user can
		// always find what they are looking for, regardless of what tab
		// the search was initiated from. Use POST_STATUSES rather than
		// "any" to do this, since the latter excludes trashed posts.
		status: search ? POST_STATUSES.join( ',' ) : status,
		tag,
		type: 'post',
	};
	const showPublishedStatus = Boolean( query.search );

	return (
		<Main wideLayout className="posts">
			<DocumentHead title={ translate( 'Posts' ) } />
			<FormattedHeader
				className="posts__page-heading"
				headerText={ translate( 'Posts' ) }
				subHeaderText={ translate(
					'Create, edit, and manage the posts on your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					'Create, edit, and manage the posts on your sites. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						count: isAllSites,
						components: {
							learnMoreLink: <InlineSupportLink supportContext="posts" showIcon={ false } />,
						},
					}
				) }
				align="left"
				hasScreenOptions
			/>
			<ScreenOptionsTab wpAdminPath="edit.php" />
			<PostTypeFilter query={ query } siteId={ siteId } statusSlug={ statusSlug } />
			<PostTypeList
				query={ query }
				showPublishedStatus={ showPublishedStatus }
				scrollContainer={ document.body }
			/>
		</Main>
	);
};
export default PostsMain;
