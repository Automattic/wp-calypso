/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import EditorSticky from 'post-editor/editor-sticky';
import * as utils from 'lib/posts/utils';
import Tooltip from 'components/tooltip';
import Button from 'components/button';
import EditorActionBarViewLabel from './view-label';
import EditorStatusLabel from 'post-editor/editor-status-label';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost, getEditedPostValue } from 'state/posts/selectors';
import PodcastIndicator from 'components/podcast-indicator';
import QuerySiteSettings from 'components/data/query-site-settings';
import getPodcastingCategoryId from 'state/selectors/get-podcasting-category-id';
import { isSingleUserSite } from 'state/sites/selectors';

class EditorActionBar extends Component {
	static propTypes = {
		savedPost: PropTypes.object,
		siteId: PropTypes.number,
		multiUserSite: PropTypes.bool,
		post: PropTypes.object,
		type: PropTypes.string,
		isPostPrivateOrPasswordProtected: PropTypes.bool,
	};

	state = {
		viewLinkTooltip: false,
	};

	showViewLinkTooltip = () => {
		this.setState( { viewLinkTooltip: true } );
	};

	hideViewLinkTooltip = () => {
		this.setState( { viewLinkTooltip: false } );
	};

	viewLinkTooltipContext = React.createRef();

	render() {
		const {
			isPostPrivateOrPasswordProtected,
			isPodcastEpisode,
			multiUserSite,
			siteId,
			type,
		} = this.props;

		const showSticky = type === 'post' && ! isPostPrivateOrPasswordProtected;

		return (
			<div className="editor-action-bar">
				{ siteId && <QuerySiteSettings siteId={ siteId } /> }

				<div className="editor-action-bar__cell is-left">
					<EditorStatusLabel />
				</div>
				<div className="editor-action-bar__cell is-center">
					{ multiUserSite && <AsyncLoad require="post-editor/editor-author" /> }
				</div>
				<div className="editor-action-bar__cell is-right">
					{ showSticky && <EditorSticky /> }
					{ isPodcastEpisode && (
						<PodcastIndicator
							className="editor-action-bar__podcasting-indicator"
							size={ 24 }
							tooltipType="episode"
						/>
					) }
					{ utils.isPublished( this.props.savedPost ) && (
						<Button
							href={ this.props.savedPost.URL }
							target="_blank"
							rel="noopener noreferrer"
							ref={ this.viewLinkTooltipContext }
							onMouseEnter={ this.showViewLinkTooltip }
							onMouseLeave={ this.hideViewLinkTooltip }
							borderless
						>
							<Gridicon icon="external" />
							<Tooltip
								className="editor-action-bar__view-post-tooltip"
								context={ this.viewLinkTooltipContext.current }
								isVisible={ this.state.viewLinkTooltip }
								position="bottom left"
							>
								<EditorActionBarViewLabel />
							</Tooltip>
						</Button>
					) }
				</div>
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const multiUserSite = isSingleUserSite( state, siteId ) === false;
	const postId = getEditorPostId( state );
	const post = getEditedPost( state, siteId, postId );
	const type = getEditedPostValue( state, siteId, postId, 'type' );
	const isPostPrivateOrPasswordProtected =
		utils.isPrivate( post ) || utils.getVisibility( post ) === 'password';

	const podcastingCategoryId = getPodcastingCategoryId( state, siteId );
	let isPodcastEpisode = false;
	if ( podcastingCategoryId ) {
		const postTerms = getEditedPostValue( state, siteId, postId, 'terms' );
		const postCategories = postTerms && postTerms.category;
		// WARNING: postCategories is an array for posts where categories have
		// been edited, but an object for posts returned from the API
		if ( some( postCategories, { ID: podcastingCategoryId } ) ) {
			isPodcastEpisode = true;
		}
	}

	return {
		siteId,
		multiUserSite,
		postId,
		post,
		type,
		isPostPrivateOrPasswordProtected,
		isPodcastEpisode,
	};
} )( EditorActionBar );
