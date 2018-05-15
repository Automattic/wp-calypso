/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import EditorDrawer from 'post-editor/editor-drawer';
import EditorSidebarHeader from './header';
import SidebarFooter from 'layout/sidebar/footer';
import EditorDeletePost from 'post-editor/editor-delete-post';

export class EditorSidebar extends Component {
	static propTypes = {
		// passed props
		savedPost: PropTypes.object,
		post: PropTypes.object,
		onSave: PropTypes.func,
		onPublish: PropTypes.func,
		onTrashingPost: PropTypes.func,
		site: PropTypes.object,
		type: PropTypes.string,
		setPostDate: PropTypes.func,
		confirmationSidebarStatus: PropTypes.string,
	};

	render() {
		const {
			onTrashingPost,
			onPublish,
			onSave,
			post,
			savedPost,
			site,
			setPostDate,
			confirmationSidebarStatus,
		} = this.props;

		return (
			<div className="editor-sidebar">
				<EditorSidebarHeader />
				<EditorDrawer
					site={ site }
					savedPost={ savedPost }
					post={ post }
					setPostDate={ setPostDate }
					onPrivatePublish={ onPublish }
					onSave={ onSave }
					confirmationSidebarStatus={ confirmationSidebarStatus }
				/>
				<SidebarFooter>
					<EditorDeletePost post={ post } onTrashingPost={ onTrashingPost } />
				</SidebarFooter>
			</div>
		);
	}
}

export default EditorSidebar;
