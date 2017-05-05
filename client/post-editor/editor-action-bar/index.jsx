/**
 * External dependencies
 */
import React, { Component } from 'react';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import EditorSticky from 'post-editor/editor-sticky';
import utils from 'lib/posts/utils';
import Tooltip from 'components/tooltip';
import Button from 'components/button';
import EditorActionBarViewLabel from './view-label';
import EditorStatusLabel from 'post-editor/editor-status-label';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost } from 'state/posts/selectors';

class EditorActionBar extends Component {

	static propTypes = {
		isNew: React.PropTypes.bool,
		onPrivatePublish: React.PropTypes.func,
		post: React.PropTypes.object,
		savedPost: React.PropTypes.object,
		site: React.PropTypes.object,
		type: React.PropTypes.string
	};

	state = {
		viewLinkTooltip: false
	};

	render() {
		const multiUserSite = this.props.site && ! this.props.site.single_user_site;
		const isPasswordProtected = utils.getVisibility( this.props.post ) === 'password';
		const isPrivate = utils.isPrivate( this.props.post );

		return (
			<div className="editor-action-bar">
				<div className="editor-action-bar__cell is-left">
					<EditorStatusLabel
						post={ this.props.savedPost }
						advancedStatus
						type={ this.props.type }
					/>
				</div>
				<div className="editor-action-bar__cell is-center">
					{ multiUserSite &&
						<AsyncLoad
							require="post-editor/editor-author"
							post={ this.props.post }
							isNew={ this.props.isNew }
						/>
					}
				</div>
				<div className="editor-action-bar__cell is-right">
					{ this.props.post && this.props.type === 'post' &&
						! isPasswordProtected && ! isPrivate &&
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
