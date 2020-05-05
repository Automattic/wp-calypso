/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { newPost } from 'lib/paths';
import Popover from 'components/popover';
import Count from 'components/count';
import { getPostsForQueryIgnoringPage, isRequestingPostsForQuery } from 'state/posts/selectors';
import Draft from 'my-sites/draft';
import QueryPosts from 'components/data/query-posts';
import { Button } from '@automattic/components';
import { getSite } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';

class MasterbarDraftsPopover extends Component {
	render() {
		const { translate } = this.props;

		return (
			<Popover
				isVisible
				onClose={ this.props.closeDrafts }
				position="bottom left"
				context={ this.props.context }
				className="masterbar__recent-drafts"
			>
				<QueryPosts siteId={ this.props.site.ID } query={ this.props.draftsQuery } />

				<div className="masterbar__recent-drafts-heading">
					<h3>{ translate( 'Recent Drafts' ) }</h3>

					<Button
						compact
						className="masterbar__recent-drafts-add-new"
						href={ newPost( this.props.site ) }
						onClick={ this.props.newDraftClicked }
					>
						{ translate( 'New Draft' ) }
					</Button>
				</div>

				<div className="masterbar__recent-drafts-list">
					{ this.renderDrafts() }

					{ this.props.loadingDrafts && <Draft isPlaceholder /> }

					<Button
						compact
						borderless
						className="masterbar__recent-drafts-see-all"
						href={ `/posts/drafts/${ this.props.site.slug }` }
						onClick={ this.props.seeAllDraftsClicked }
					>
						{ translate( 'See All' ) }
						{ this.props.draftCount ? <Count count={ this.props.draftCount } /> : null }
					</Button>
				</div>
			</Popover>
		);
	}

	renderDrafts() {
		const { site, drafts } = this.props;

		if ( ! drafts ) {
			return null;
		}

		return drafts.map( ( draft ) => (
			<Draft
				key={ draft.global_ID }
				post={ draft }
				siteId={ site.ID }
				showAuthor={ ! site.single_user_site && ! this.props.userId }
				onTitleClick={ this.props.draftClicked }
			/>
		) );
	}
}

// Memoizes the last value of the `draftsQuery` object if the dependencies (userId and siteId)
// didn't change. Prevents rerenders of the component.
const getDraftsQuery = createSelector(
	( state, siteId ) => {
		const userId = getCurrentUserId( state );
		const site = getSite( state, siteId );

		return {
			type: 'post',
			status: 'draft',
			number: 5,
			order_by: 'modified',
			author: ! site.jetpack && ! site.single_user_site ? userId : null,
		};
	},
	( state, siteId ) => [ getCurrentUserId( state ), getSite( state, siteId ) ]
);

export default connect( ( state, { siteId } ) => {
	const draftsQuery = getDraftsQuery( state, siteId );

	return {
		site: getSite( state, siteId ),
		draftsQuery,
		drafts: getPostsForQueryIgnoringPage( state, siteId, draftsQuery ),
		loadingDrafts: isRequestingPostsForQuery( state, siteId, draftsQuery ),
	};
} )( localize( MasterbarDraftsPopover ) );
