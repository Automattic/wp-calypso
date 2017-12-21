/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSite } from 'state/ui/selectors';
import Popover from 'components/popover';
import Count from 'components/count';
import { getMyPostCounts } from 'state/posts/counts/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPostsForQueryIgnoringPage, isRequestingPostsForQuery } from 'state/posts/selectors';
import paths from 'lib/paths';
import Draft from 'my-sites/draft';
import QueryPosts from 'components/data/query-posts';
import QueryPostCounts from 'components/data/query-post-counts';
import Button from 'components/button';
import { getCurrentUserId } from 'state/current-user/selectors';

class MasterbarDrafts extends Component {
	static propTypes = {
		user: PropTypes.object,
		isActive: PropTypes.bool,
		className: PropTypes.string,
		tooltip: PropTypes.string,
		selectedSite: PropTypes.object,
	};

	state = {
		showDrafts: false,
	};

	toggleDrafts = () => {
		const { showDrafts } = this.state;
		this.setState( {
			showDrafts: ! showDrafts,
		} );
	};

	closeDrafts = () => {
		this.setState( { showDrafts: false } );
	};

	draftClicked = () => {
		this.props.recordDraftSelected();
		this.closeDrafts();
	};

	newDraftClicked = () => {
		this.props.recordNewDraftClicked();
		this.closeDrafts();
	};

	seeAllDraftsClicked = () => {
		this.props.recordSeeAllDraftsClicked();
		this.closeDrafts();
	};

	render() {
		const { selectedSite, draftCount, loadingDrafts, translate } = this.props;
		const isLoading = draftCount === 0 && loadingDrafts;

		if ( ! selectedSite ) {
			return null;
		}

		return (
			<div>
				<QueryPostCounts siteId={ selectedSite.ID } type="post" />
				{ this.props.draftCount > 0 && (
					<Button
						compact
						borderless
						className="masterbar__toggle-drafts"
						onClick={ this.toggleDrafts }
						ref="drafts"
						title={ translate( 'Latest Drafts' ) }
					>
						<Count count={ this.props.draftCount } />
					</Button>
				) }
				<Popover
					isVisible={ this.state.showDrafts }
					onClose={ this.closeDrafts }
					position="bottom left"
					context={ this.refs && this.refs.drafts }
					className="masterbar__recent-drafts"
				>
					<QueryPosts siteId={ selectedSite.ID } query={ this.props.draftsQuery } />

					<div className="masterbar__recent-drafts-heading">
						<h3>{ translate( 'Recent Drafts' ) }</h3>

						<Button
							compact
							className="masterbar__recent-drafts-add-new"
							href={ paths.newPost( selectedSite ) }
							onClick={ this.newDraftClicked }
						>
							{ translate( 'New Draft' ) }
						</Button>
					</div>

					<div className="masterbar__recent-drafts-list">
						{ this.props.drafts && this.props.drafts.map( this.renderDraft, this ) }

						{ isLoading && <Draft isPlaceholder /> }

						<Button
							compact
							borderless
							className="masterbar__recent-drafts-see-all"
							href={ `/posts/drafts/${ selectedSite.slug }` }
							onClick={ this.seeAllDraftsClicked }
						>
							{ translate( 'See All' ) }
							{ this.props.draftCount ? <Count count={ this.props.draftCount } /> : null }
						</Button>
					</div>
				</Popover>
			</div>
		);
	}

	renderDraft( draft ) {
		if ( ! draft ) {
			return null;
		}

		const site = this.props.selectedSite;

		return (
			<Draft
				key={ draft.global_ID }
				post={ draft }
				siteId={ site && site.ID }
				showAuthor={ site && ! site.single_user_site && ! this.props.userId }
				onTitleClick={ this.draftClicked }
			/>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const userId = getCurrentUserId( state );
	const site = getSelectedSite( state );
	const draftsQuery = {
		type: 'post',
		status: 'draft',
		number: 5,
		order_by: 'modified',
		author: site && ! site.jetpack && ! site.single_user_site ? userId : null,
	};

	const myPostCounts = getMyPostCounts( state, siteId, 'post' );

	return {
		drafts: getPostsForQueryIgnoringPage( state, siteId, draftsQuery ),
		loadingDrafts: isRequestingPostsForQuery( state, siteId, draftsQuery ),
		draftsQuery: draftsQuery,
		draftCount: myPostCounts && myPostCounts.draft,
		selectedSite: site,
	};
};

const mapDispatchToProps = dispatch => ( {
	recordDraftSelected: () => {
		dispatch( recordTracksEvent( 'calypso_masterbar_draft_selected' ) );
	},
	recordNewDraftClicked: () => {
		dispatch( recordTracksEvent( 'calypso_masterbar_drafts_new_draft_clicked' ) );
	},
	recordSeeAllDraftsClicked: () => {
		dispatch( recordTracksEvent( 'calypso_masterbar_drafts_see_all_drafts_clicked' ) );
	},
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( MasterbarDrafts ) );
