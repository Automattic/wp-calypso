/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import EditorDrawer from 'post-editor/editor-drawer';
import EditorGroundControl from 'post-editor/editor-ground-control';
import AsyncLoad from 'components/async-load';
import EditorSidebarHeader from './header';
import SidebarFooter from 'layout/sidebar/footer';

export default React.createClass( {
	displayName: 'EditorSidebar',

	propTypes: {
		allPostsUrl: PropTypes.string,
		sites: PropTypes.array,
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
		showDrafts: PropTypes.bool
	},

	render() {
		return (
			<div className="post-editor__sidebar">
				<EditorSidebarHeader
					allPostsUrl={ this.props.allPostsUrl } />
				{ this.props.showDrafts
					? <AsyncLoad
						require="my-sites/drafts/draft-list"
						sites={ this.props.sites }
						onTitleClick={ this.props.onTitleClick }
						showAllActionsMenu={ false }
						siteID={ this.props.site ? this.props.site.ID : null }
						selectedId={ this.props.post ? this.props.post.ID : null }
					/>
					: <div>
					<EditorGroundControl { ...this.props } />
					<EditorDrawer { ...this.props } />
					<SidebarFooter />
				</div> }
			</div>
		);
	}

} );
