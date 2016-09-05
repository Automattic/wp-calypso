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
import CreditCardForm from 'blocks/credit-card-form/docs/example';
import HeaderCake from 'components/header-cake';
import SearchCard from 'components/search-card';
import AuthorSelector from 'blocks/author-selector/docs/example';
import CommentButtons from 'blocks/comment-button/docs/example';
import FollowButton from 'components/follow-button/docs/example';
import LikeButtons from 'blocks/like-button/docs/example';
import PostSchedule from 'components/post-schedule/docs/example';
import PostSelector from 'my-sites/post-selector/docs/example';
import Sites from 'lib/sites-list/docs/example';
import SitesDropdown from 'components/sites-dropdown/docs/example';
import Theme from 'components/theme/docs/example';
import Collection from 'devdocs/design/search-collection';
import HappinessSupport from 'components/happiness-support/docs/example';
import ThemesListExample from 'components/themes-list/docs/example';
import PlanStorage from 'my-sites/plan-storage/docs/example';
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
import RelatedPostCard from 'blocks/reader-related-card/docs/example';
import RelatedPostCardv2 from 'blocks/reader-related-card-v2/docs/example';
import SearchPostCard from 'blocks/reader-search-card/docs/example';
import PlanPrice from 'my-sites/plan-price/docs/example';
import PlanThankYouCard from 'blocks/plan-thank-you-card/docs/example';
import DismissibleCard from 'blocks/dismissible-card/docs/example';
import PostEditButton from 'blocks/post-edit-button/docs/example';
import ReaderAvatar from 'blocks/reader-avatar/docs/example';
import DomainToPlanNudge from 'blocks/domain-to-plan-nudge/docs/example';

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
			<div className="design-assets" role="main">
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
					<CommentButtons />
					<CreditCardForm />
					<FollowButton />
					<HappinessSupport />
					<LikeButtons />
					<PostEditButton />
					<PlanStorage />
					<PostSchedule />
					<PostSelector />
					<Sites />
					<SitesDropdown />
					<Theme />
					<ThemesListExample />
					<UpgradeNudge />
					<PlanCompareCard />
					<FeatureComparison />
					<DomainTip />
					<RelatedPostCard />
					<RelatedPostCardv2 />
					<SearchPostCard />
					<PostItem />
					<PostRelativeTime />
					<PostStatus />
					<ReaderAuthorLink />
					<ReaderSiteStreamLink />
					<ReaderFullPostHeader />
					<AuthorCompactProfile />
					<PlanPrice />
					<PlanThankYouCard />
					<DismissibleCard />
					<ReaderAvatar />
					<DomainToPlanNudge />
				</Collection>
			</div>
		);
	}
} );
