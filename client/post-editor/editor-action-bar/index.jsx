/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EditorActionBarViewLabel from './view-label';
import AsyncLoad from 'components/async-load';
import Button from 'components/button';
import Tooltip from 'components/tooltip';
import utils from 'lib/posts/utils';
import EditorStatusLabel from 'post-editor/editor-status-label';
import EditorSticky from 'post-editor/editor-sticky';
import { getEditedPost } from 'state/posts/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class EditorActionBar extends Component {

	static propTypes = {
		isNew: PropTypes.bool,
		onPrivatePublish: PropTypes.func,
		post: PropTypes.object,
		savedPost: PropTypes.object,
		site: PropTypes.object,
		type: PropTypes.string,
		isPostPrivate: PropTypes.bool,
		postAuthor: PropTypes.object,
		hasEditorNestedSidebar: PropTypes.bool,
	};

	state = {
		viewLinkTooltip: false
	};

	render() {
		// We store privacy changes via Flux while we store password changes via Redux.
		// This results in checking Flux for some items and Redux for others to correctly
		// update based on post changes. Flux changes are passed down from parent components.
		const multiUserSite = this.props.site && ! this.props.site.single_user_site;
		const isPasswordProtected = utils.getVisibility( this.props.post ) === 'password';
		const { isPostPrivate, postAuthor } = this.props;

		return (
			<div className="editor-action-bar">
				<div className="editor-action-bar__cell is-left">
					{ ! this.props.hasEditorNestedSidebar &&
						<EditorStatusLabel
							post={ this.props.savedPost }
							advancedStatus
							type={ this.props.type }
						/>
					}
				</div>
				<div className="editor-action-bar__cell is-center">
					{ multiUserSite &&
						<AsyncLoad
							require="post-editor/editor-author"
							post={ this.props.post }
							isNew={ this.props.isNew }
							postAuthor={ postAuthor }
						/>
					}
				</div>
				<div className="editor-action-bar__cell is-right">
					{ this.props.post && this.props.type === 'post' &&
						! isPasswordProtected && ! isPostPrivate &&
						<EditorSticky />
					}
					{ utils.isPublished( this.props.savedPost ) && (
						<Button
							href={ this.props.savedPost.URL }
							target="_blank"
							rel="noopener noreferrer"
							onMouseEnter={ () => this.setState( { viewLinkTooltip: true } ) }
							onMouseLeave={ () => this.setState( { viewLinkTooltip: false } ) }
							ref="viewLink"
							borderless
						>
							<Gridicon icon="external" />
							<Tooltip
								className="editor-action-bar__view-post-tooltip"
								context={ this.refs && this.refs.viewLink }
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

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const post = getEditedPost( state, siteId, postId );

		return {
			siteId,
			postId,
			post
		};
	},
)( EditorActionBar );
