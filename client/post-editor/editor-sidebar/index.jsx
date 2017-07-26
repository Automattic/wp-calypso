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
import EditorFeedbackInvitation from 'post-editor/editor-feedback-invitation';
import EditorDeletePost from 'post-editor/editor-delete-post';
import FeedbackView from './feedback-view';

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
	};

	state = { showFeedback: false };

	openFeedbackPane = () => this.setState( { showFeedback: true } );
	closeFeedbackPane = () => this.setState( { showFeedback: false } );

	render() {
		const {
			toggleSidebar,
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
				{ this.state.showFeedback
					? <FeedbackView close={ this.closeFeedbackPane } />
					: <div className="editor-sidebar__view">
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
							<EditorFeedbackInvitation onTrigger={ this.openFeedbackPane } />
							<SidebarFooter>
								<EditorDeletePost post={ post } onTrashingPost={ onTrashingPost } />
							</SidebarFooter>
						</div> }
			</div>
		);
	}
}
