/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { trim } from 'lodash';
import { slugToCamelCase } from 'devdocs/docs-example/util';

/**
 * Internal dependencies
 */
import Collection from 'devdocs/design/search-collection';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import SearchCard from 'components/search-card';
import { isEnabled } from 'config';

/**
 * Docs examples
 */
import CreditCardForm from 'blocks/credit-card-form/docs/example';
import CalendarButton from 'blocks/calendar-button/docs/example';
import CalendarPopover from 'blocks/calendar-popover/docs/example';
import AuthorSelector from 'blocks/author-selector/docs/example';
import CommentButtons from 'blocks/comment-button/docs/example';
import DisconnectJetpackDialog from 'blocks/disconnect-jetpack-dialog/docs/example';
import FollowButton from 'blocks/follow-button/docs/example';
import LikeButtons from 'blocks/like-button/docs/example';
import PostSchedule from 'components/post-schedule/docs/example';
import PostSelector from 'my-sites/post-selector/docs/example';
import Sites from 'lib/sites-list/docs/example';
import SitesDropdown from 'components/sites-dropdown/docs/example';
import SiteIcon from 'blocks/site-icon/docs/example';
import Theme from 'components/theme/docs/example';
import HappinessSupport from 'components/happiness-support/docs/example';
import ThemesListExample from 'components/themes-list/docs/example';
import PlanStorage from 'blocks/plan-storage/docs/example';
import UpgradeNudge from 'my-sites/upgrade-nudge/docs/example';
import PlanCompareCard from 'my-sites/plan-compare-card/docs/example';
import FeatureComparison from 'my-sites/feature-comparison/docs/example';
import DomainTip from 'my-sites/domain-tip/docs/example';
import PostItem from 'blocks/post-item/docs/example';
import PostRelativeTime from 'blocks/post-relative-time/docs/example';
import PostStatus from 'blocks/post-status/docs/example';
import ReaderAuthorLink from 'blocks/reader-author-link/docs/example';
import ReaderSiteStreamLink from 'blocks/reader-site-stream-link/docs/example';
import ReaderFullPostHeader from 'blocks/reader-full-post/docs/header-example';
import AuthorCompactProfile from 'blocks/author-compact-profile/docs/example';
import RelatedPostCardv2 from 'blocks/reader-related-card-v2/docs/example';
import PlanPrice from 'my-sites/plan-price/docs/example';
import PlanThankYouCard from 'blocks/plan-thank-you-card/docs/example';
import DismissibleCard from 'blocks/dismissible-card/docs/example';
import PostEditButton from 'blocks/post-edit-button/docs/example';
import ReaderAvatar from 'blocks/reader-avatar/docs/example';
import ImageEditor from 'blocks/image-editor/docs/example';
import ReaderPostCard from 'blocks/reader-post-card/docs/example';
import ReaderCombinedCard from 'blocks/reader-combined-card/docs/example';
import ReaderPostOptionsMenu from 'blocks/reader-post-options-menu/docs/example';
import DailyPostButton from 'blocks/daily-post-button/docs/example';
import ReaderSubscriptionListItem from 'blocks/reader-subscription-list-item/docs/example';
import PostLikes from 'blocks/post-likes/docs/example';
import ReaderFeaturedVideo from 'blocks/reader-featured-video/docs/example';
import NpsSurvey from 'blocks/nps-survey/docs/example';
import ReaderExportButton from 'blocks/reader-export-button/docs/example';
import ReaderImportButton from 'blocks/reader-import-button/docs/example';
import SharingPreviewPane from 'blocks/sharing-preview-pane/docs/example';
import ReaderShare from 'blocks/reader-share/docs/example';
import Login from 'blocks/login/docs/example';

export default React.createClass( {

	displayName: 'AppComponents',

	getInitialState() {
		return { filter: '' };
	},

	onSearch( term ) {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	},

	backToComponents() {
		page( '/devdocs/blocks/' );
	},

	render() {
		return (
			<Main className="design">
				{
					this.props.component
					? <HeaderCake onClick={ this.backToComponents } backText="All Blocks">
						{ slugToCamelCase( this.props.component ) }
					</HeaderCake>
					: <SearchCard
						onSearch={ this.onSearch }
						initialValue={ this.state.filter }
						placeholder="Search blocks…"
						analyticsGroup="Docs">
					</SearchCard>
				}
				<Collection
					component={ this.props.component }
					filter={ this.state.filter }
					section="blocks"
				>
					<AuthorSelector />
					<CalendarButton />
					<CalendarPopover />
					<CommentButtons />
					<DisconnectJetpackDialog />
					<CreditCardForm />
					<FollowButton />
					<HappinessSupport />
					<ImageEditor />
					<LikeButtons />
					<Login />
					<PostEditButton />
					<PlanStorage />
					<PostSchedule />
					<PostSelector />
					<Sites />
					<SitesDropdown />
					<SiteIcon />
					<Theme />
					<ThemesListExample />
					<UpgradeNudge />
					<PlanCompareCard />
					<FeatureComparison />
					<DomainTip />
					<RelatedPostCardv2 />
					<PostItem />
					<PostRelativeTime />
					<PostStatus />
					<ReaderAuthorLink />
					<ReaderSubscriptionListItem />
					<ReaderSiteStreamLink />
					<ReaderFullPostHeader />
					<AuthorCompactProfile />
					<ReaderPostCard />
					<ReaderCombinedCard />
					<PlanPrice />
					<PlanThankYouCard />
					<DismissibleCard />
					<ReaderAvatar />
					<ReaderPostOptionsMenu />
					<DailyPostButton />
					<PostLikes />
					<ReaderFeaturedVideo />
					{ isEnabled( 'nps-survey/devdocs' ) && <NpsSurvey /> }
					<ReaderExportButton />
					<ReaderImportButton />
					<SharingPreviewPane />
					<ReaderShare />
				</Collection>
			</Main>
		);
	}
} );
