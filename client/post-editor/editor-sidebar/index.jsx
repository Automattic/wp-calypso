/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { NESTED_SIDEBAR_NONE, NESTED_SIDEBAR_REVISIONS } from 'state/ui/editor/sidebar/constants';
import { setNestedSidebar, closeEditorSidebar } from 'state/ui/editor/sidebar/actions';
import { getNestedSidebarTarget } from 'state/ui/editor/sidebar/selectors';
import EditorDrawer from 'post-editor/editor-drawer';
import EditorSidebarHeader from './header';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarRegion from 'layout/sidebar/region';
import EditorActionBar from 'post-editor/editor-action-bar';
import EditorDeletePost from 'post-editor/editor-delete-post';
import EditorRevisionsList from 'post-editor/editor-revisions-list';

export class EditorSidebar extends Component {
	static propTypes = {
		// passed props
		savedPost: PropTypes.object,
		post: PropTypes.object,
		isNew: PropTypes.bool,
		onSave: PropTypes.func,
		onPublish: PropTypes.func,
		onTrashingPost: PropTypes.func,
		site: PropTypes.object,
		toggleSidebar: PropTypes.func,
		type: PropTypes.string,
		setPostDate: PropTypes.func,
		isPostPrivate: PropTypes.bool,
		confirmationSidebarStatus: PropTypes.string,
		loadRevision: PropTypes.func,
		selectedRevisionId: PropTypes.number,
		selectRevision: PropTypes.func,

		// connected props
		nestedSidebarTarget: PropTypes.oneOf( [ NESTED_SIDEBAR_NONE, NESTED_SIDEBAR_REVISIONS ] ),
		setNestedSidebar: PropTypes.func.isRequired,
		closeEditorSidebar: PropTypes.func.isRequired,
	};

	closeSidebar = () => {
		if ( this.props.nestedSidebarTarget !== NESTED_SIDEBAR_NONE ) {
			// attempt to close the nested sidebar if it has content
			this.props.setNestedSidebar( NESTED_SIDEBAR_NONE );
		} else {
			// otherwise, close the sidebar completely
			this.props.closeEditorSidebar();
		}
	};

	render() {
		const {
			isNew,
			onTrashingPost,
			onPublish,
			onSave,
			post,
			savedPost,
			site,
			setPostDate,
			isPostPrivate,
			confirmationSidebarStatus,
			nestedSidebarTarget,
			setNestedSidebar,
			loadRevision,
			selectedRevisionId,
			selectRevision,
		} = this.props;

		const sidebarClassNames = classNames( 'editor-sidebar', {
			'is-nested-sidebar-focused': nestedSidebarTarget !== NESTED_SIDEBAR_NONE,
		} );

		return (
			<div className={ sidebarClassNames }>
				<EditorSidebarHeader
					nestedSidebar={ nestedSidebarTarget }
					closeSidebar={ this.closeSidebar }
				/>
				<EditorActionBar isNew={ isNew } post={ post } savedPost={ savedPost } site={ site } />
				<SidebarRegion className="editor-sidebar__parent-region">
					<EditorDrawer
						site={ site }
						savedPost={ savedPost }
						post={ post }
						isNew={ isNew }
						setPostDate={ setPostDate }
						onPrivatePublish={ onPublish }
						onSave={ onSave }
						isPostPrivate={ isPostPrivate }
						confirmationSidebarStatus={ confirmationSidebarStatus }
						setNestedSidebar={ setNestedSidebar }
						selectRevision={ selectRevision }
					/>
				</SidebarRegion>
				<SidebarRegion className="editor-sidebar__nested-region editor-sidebar__nonscrolling-region">
					{ nestedSidebarTarget === NESTED_SIDEBAR_REVISIONS && (
						<EditorRevisionsList
							loadRevision={ loadRevision }
							selectedRevisionId={ selectedRevisionId }
							selectRevision={ selectRevision }
						/>
					) }
				</SidebarRegion>
				<SidebarFooter>
					{ nestedSidebarTarget === NESTED_SIDEBAR_NONE && (
						<EditorDeletePost post={ post } onTrashingPost={ onTrashingPost } />
					) }
				</SidebarFooter>
			</div>
		);
	}
}

export default connect(
	state => ( {
		nestedSidebarTarget: getNestedSidebarTarget( state ),
	} ),
	{
		setNestedSidebar,
		closeEditorSidebar,
	}
)( EditorSidebar );
