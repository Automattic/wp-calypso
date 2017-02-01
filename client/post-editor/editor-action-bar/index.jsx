/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import EditorDeletePost from 'post-editor/editor-delete-post';
import EditorPostType from 'post-editor/editor-post-type';
import EditorSticky from 'post-editor/editor-sticky';
import EditorVisibility from 'post-editor/editor-visibility';
import utils from 'lib/posts/utils';
import Tooltip from 'components/tooltip';
import Button from 'components/button';
import EditorActionBarViewLabel from './view-label';

export default React.createClass( {

	displayName: 'EditorActionBar',

	propTypes: {
		isNew: React.PropTypes.bool,
		onTrashingPost: React.PropTypes.func,
		onPrivatePublish: React.PropTypes.func,
		post: React.PropTypes.object,
		savedPost: React.PropTypes.object,
		site: React.PropTypes.object,
		type: React.PropTypes.string
	},

	getInitialState: function() {
		return {
			viewLinkTooltip: false
		};
	},

	renderPostVisibility() {
		if ( ! this.props.post ) {
			return;
		}

		const { status, password, type } = this.props.post || {};
		const isPrivateSite = this.props.site && this.props.site.is_private;
		const savedStatus = this.props.savedPost ? this.props.savedPost.status : null;
		const savedPassword = this.props.savedPost ? this.props.savedPost.password : null;
		const props = {
			visibility: utils.getVisibility( this.props.post ),
			onPrivatePublish: this.props.onPrivatePublish,
			isPrivateSite,
			type,
			status,
			password,
			savedStatus,
			savedPassword
		};

		return (
			<EditorVisibility { ...props } />
		);
	},

	render() {
		const multiUserSite = this.props.site && ! this.props.site.single_user_site;

		return (
			<div className="editor-action-bar">
				<div className="editor-action-bar__cell is-left">
					{ multiUserSite &&
						<AsyncLoad
							require="post-editor/editor-author"
							post={ this.props.post }
							isNew={ this.props.isNew }
						/>
					}
				</div>
				<div className="editor-action-bar__cell is-center">
					<EditorPostType />
				</div>
				<div className="editor-action-bar__cell is-right">
					{ this.props.post && this.props.type === 'post' && <EditorSticky /> }
					{ this.renderPostVisibility() }
					<EditorDeletePost
						post={ this.props.post }
						onTrashingPost={ this.props.onTrashingPost }
					/>
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
} );
