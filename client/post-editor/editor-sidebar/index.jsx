/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';

/**
 * Internal dependencies
 */
import EditorDrawer from 'post-editor/editor-drawer';
import EditorSidebarHeader from './header';
import SidebarFooter from 'layout/sidebar/footer';
import EditorActionBar from 'post-editor/editor-action-bar';
import EditorFeedbackRequest from 'post-editor/editor-feedback-request';
import EditorDeletePost from 'post-editor/editor-delete-post';

export default class EditorSidebar extends Component {
	static propTypes = {
		savedPost: PropTypes.object,
		post: PropTypes.object,
		isNew: PropTypes.bool,
		onSave: PropTypes.func,
		onPublish: PropTypes.func,
		onTrashingPost: PropTypes.func,
		site: PropTypes.object,
		type: PropTypes.string,
		toggleSidebar: PropTypes.func,
		setPostDate: PropTypes.func,
		isPrivate: PropTypes.bool,
	}

	_viewFeedbackPane = () => {
		// eslint-disable-next-line
		console.log( 'view feedback pane' );
	};

	render() {
		const { toggleSidebar,
			isNew,
			onTrashingPost,
			onPublish,
			onSave,
			post,
			savedPost,
			site,
			type,
			setPostDate,
			isPostPrivate,
		} = this.props;

		return (
			<div className="editor-sidebar">
				<EditorSidebarHeader toggleSidebar={ toggleSidebar } />
				<EditorActionBar
					isNew={ isNew }
					post={ post }
					savedPost={ savedPost }
					site={ site }
					type={ type }
				/>
				<EditorDrawer
					site={ site }
					savedPost={ savedPost }
					post={ post }
					isNew={ isNew }
					type={ type }
					setPostDate={ setPostDate }
					onPrivatePublish={ onPublish }
					onSave={ onSave }
					isPostPrivate={ isPostPrivate }
				/>
				<EditorFeedbackRequest onTrigger={ this._viewFeedbackPane } />
				<SidebarFooter>
					<EditorDeletePost
						post={ post }
						onTrashingPost={ onTrashingPost }
					/>
				</SidebarFooter>
			</div>
		);
	}

}
