/**
* External dependencies
*/
import React from 'react';
import page from 'page';
import toTitleCase from 'to-title-case';
import trim from 'lodash/trim';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import SearchCard from 'components/search-card';
import CommentButtons from 'components/comment-button/docs/example';
import FollowButtons from 'components/follow-button/docs/example';
import LikeButtons from 'components/like-button/docs/example';
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

export default React.createClass( {

	displayName: 'AppComponents',

	getInitialState() {
		return { filter: '' };
	},

	onSearch( term ) {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	},

	backToComponents() {
		page( '/devdocs/app-components/' );
	},

	render() {
		return (
			<div className="design-assets" role="main">
				{
					this.props.component
					? <HeaderCake onClick={ this.backToComponents } backText="All App Components">
						{ toTitleCase( this.props.component ) }
					</HeaderCake>
					: <SearchCard
						onSearch={ this.onSearch }
						initialValue={ this.state.filter }
						placeholder="Search app components…"
						analyticsGroup="Docs">
					</SearchCard>
				}
				<Collection component={ this.props.component } filter={ this.state.filter }>
					<CommentButtons />
					<FollowButtons />
					<HappinessSupport />
					<LikeButtons />
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
				</Collection>
			</div>
		);
	}
} );
