/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';

/**
 * Internal dependencies
 */
import EditorDrawer from 'post-editor/editor-drawer';
import AsyncLoad from 'components/async-load';
import EditorSidebarHeader from './header';
import SidebarFooter from 'layout/sidebar/footer';
import EditorActionBar from 'post-editor/editor-action-bar';

export default class EditorSidebar extends Component {
	static propTypes = {
		allPostsUrl: PropTypes.string,
		sites: PropTypes.object,
		onTitleClick: PropTypes.func,
		savedPost: PropTypes.object,
		post: PropTypes.object,
		isNew: PropTypes.bool,
		isDirty: PropTypes.bool,
		isSaveBlocked: PropTypes.bool,
		hasContent: PropTypes.bool,
		isSaving: PropTypes.bool,
		isPublishing: PropTypes.bool,
		onSave: PropTypes.func,
		onPreview: PropTypes.func,
		onPublish: PropTypes.func,
		onTrashingPost: PropTypes.func,
		site: PropTypes.object,
		user: PropTypes.object,
		userUtils: PropTypes.object,
		type: PropTypes.string,
		showDrafts: PropTypes.bool,
		onMoreInfoAboutEmailVerify: PropTypes.func,
		warnPublishDateChange: PropTypes.func
	}

	renderDraftsList() {
		return (
			<AsyncLoad
				require="my-sites/drafts/draft-list"
				sites={ this.props.sites }
				onTitleClick={ this.props.onTitleClick }
				showAllActionsMenu={ false }
				siteID={ this.props.site ? this.props.site.ID : null }
				selectedId={ this.props.post ? this.props.post.ID : null }
			/>
		);
	}

	renderSidebar() {
		return (
			<div>
				<EditorActionBar
					isNew={ this.props.isNew }
					onTrashingPost={ this.props.onTrashingPost }
					onPrivatePublish={ this.props.onPublish }
					post={ this.props.post }
					savedPost={ this.props.savedPost }
					site={ this.props.site }
					type={ this.props.type }
				/>
				<EditorDrawer
					site={ this.props.site }
					post={ this.props.post }
					isNew={ this.props.isNew }
					type={ this.props.type }
				/>
			</div>
		);
	}

	render() {
		return (
			<div className="post-editor__sidebar">
				<EditorSidebarHeader
					allPostsUrl={ this.props.allPostsUrl } />
				{ this.props.showDrafts ? this.renderDraftsList() : this.renderSidebar() }
				<SidebarFooter />
			</div>
		);
	}

}
