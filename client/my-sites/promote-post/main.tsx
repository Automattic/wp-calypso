import './style.scss';

import { translate } from 'i18n-calypso';
import SitePreview from 'calypso/blocks/site-preview';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import PromotedPostFilter from 'calypso/my-sites/promote-post/components/promoted-post-filter';
import PromotedPostList from 'calypso/my-sites/promote-post/components/promoted-post-list';

// type Props = {
// 	siteId: number;
// 	siteSlug: string;
// };

export default function PromotedPosts() {
	return (
		<Main wideLayout className="promote-post">
			{ /* todo do we need those? */ }
			{ /*<ScreenOptionsTab wpAdminPath="edit.php?post_type=page" />*/ }
			{ /*<PageViewTracker path={ this.getAnalyticsPath() } title={ this.getAnalyticsTitle() } />*/ }
			<DocumentHead title={ translate( 'Promoted Posts' ) } />
			<SitePreview />
			<FormattedHeader
				brandFont
				className="promote-post__heading"
				headerText={ translate( 'Promoted posts' ) }
				subHeaderText={ translate( 'Create, edit, and manage your promoted posts.' ) }
				align="left"
				// hasScreenOptions
			/>

			<PromotedPostFilter />

			<PromotedPostList />
		</Main>
	);
}
