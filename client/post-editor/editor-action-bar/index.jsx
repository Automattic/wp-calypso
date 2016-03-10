/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import EditorAuthor from 'post-editor/editor-author';
import EditorDeletePost from 'post-editor/editor-delete-post';
import EditorPostType from 'post-editor/editor-post-type';
import EditorVisibility from 'post-editor/editor-visibility';
import Gridicon from 'components/gridicon';
import utils from 'lib/posts/utils';
import Tooltip from 'components/tooltip';

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
			siteId: this.props.site ? this.props.site.ID : null,
			postId: this.props.post ? this.props.post.ID : null,
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
			<EditorVisibility {...props} />
		);
	},

	render() {
		const multiUserSite = this.props.site && ! this.props.site.single_user_site;

		return (
			<div className="editor-action-bar">
				<div className="editor-action-bar__first-group">
					{ multiUserSite && <EditorAuthor post={ this.props.post } isNew={ this.props.isNew } /> }
				</div>
				<EditorPostType
					type={ this.props.type }
					isNew={ this.props.isNew }
					siteSlug={ this.props.site && this.props.site.slug }
				/>
				<div className="editor-action-bar__last-group">
					{ this.renderPostVisibility() }
					<EditorDeletePost
						post={ this.props.post }
						onTrashingPost={ this.props.onTrashingPost }
					/>
					{ utils.isPublished( this.props.savedPost ) &&
						<a
							className="editor-action-bar__view-link"
							href={ this.props.savedPost.URL }
							target="_blank"
							onMouseEnter={ () => this.setState( { viewLinkTooltip: true } ) }
							onMouseLeave={ () => this.setState( { viewLinkTooltip: false } ) }
							ref="viewLink"
						>
							<Gridicon icon="external" />
							<Tooltip
								context={ this.refs && this.refs.viewLink }
								isVisible={ this.state.viewLinkTooltip }
								position="bottom left"
							>
								{ this.props.type === 'page' ?
									this.translate( 'View page' ) :
									this.translate( 'View post' )
								}
							</Tooltip>
						</a> }
				</div>
			</div>
		);
	}
} );
