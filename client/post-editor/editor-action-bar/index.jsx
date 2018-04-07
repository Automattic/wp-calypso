/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import { find } from 'lodash';

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
import getPodcastingCategoryId from 'state/selectors/get-podcasting-category-id';

class EditorActionBar extends Component {
	static propTypes = {
		isNew: PropTypes.bool,
		onPrivatePublish: PropTypes.func,
		post: PropTypes.object,
		savedPost: PropTypes.object,
		site: PropTypes.object,
		type: PropTypes.string,
		isPostPrivate: PropTypes.bool,
	};

	constructor( props ) {
		super( props );
		this.state = {
			viewLinkTooltip: false,
		};
	}

	showViewLinkTooltip = () => {
		this.setState( { viewLinkTooltip: true } );
	};

	hideViewLinkTooltip = () => {
		this.setState( { viewLinkTooltip: false } );
	};

	setViewLinkTooltipContext = viewLinkTooltipContext => {
		if ( viewLinkTooltipContext ) {
			this.setState( { viewLinkTooltipContext } );
		}
	};

	render() {
		// We store privacy changes via Flux while we store password changes via Redux.
		// This results in checking Flux for some items and Redux for others to correctly
		// update based on post changes. Flux changes are passed down from parent components.
		const multiUserSite = this.props.site && ! this.props.site.single_user_site;
		const isPasswordProtected = utils.getVisibility( this.props.post ) === 'password';
		const { isPostPrivate, isPodcastEpisode } = this.props;

		return (
			<div className="editor-action-bar">
				<div className="editor-action-bar__cell is-left">
					<EditorStatusLabel post={ this.props.savedPost } advancedStatus />
				</div>
				<div className="editor-action-bar__cell is-center">
					{ multiUserSite && (
						<AsyncLoad require="post-editor/editor-author" isNew={ this.props.isNew } />
					) }
				</div>
				<div className="editor-action-bar__cell is-right">
					{ this.props.post &&
						this.props.type === 'post' &&
						! isPasswordProtected &&
						! isPostPrivate && <EditorSticky /> }
					{ isPodcastEpisode && (
						<PodcastIndicator
							className="editor-action-bar__podcasting-indicator"
							size={ 24 }
							hasTooltip={ true }
						/>
					) }
					{ utils.isPublished( this.props.savedPost ) && (
						<Button
							href={ this.props.savedPost.URL }
							target="_blank"
							rel="noopener noreferrer"
							ref={ this.setViewLinkTooltipContext }
							onMouseEnter={ this.showViewLinkTooltip }
							onMouseLeave={ this.hideViewLinkTooltip }
							borderless
						>
							<Gridicon icon="external" />
							<Tooltip
								className="editor-action-bar__view-post-tooltip"
								context={ this.state.viewLinkTooltipContext }
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
	const postId = getEditorPostId( state );
	const post = getEditedPost( state, siteId, postId );
	const type = getEditedPostValue( state, siteId, postId, 'type' );

	const podcastingCategoryId = getPodcastingCategoryId( state, siteId );
	let isPodcastEpisode = false;
	if ( podcastingCategoryId ) {
		const postCategories = getEditedPostValue( state, siteId, postId, 'categories' );
		isPodcastEpisode = find( postCategories, { ID: podcastingCategoryId } ) !== undefined;
	}

	return {
		siteId,
		postId,
		post,
		type,
		isPodcastEpisode,
	};
} )( EditorActionBar );
