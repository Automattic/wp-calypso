/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { NESTED_SIDEBAR_NONE, NESTED_SIDEBAR_REVISIONS, NestedSidebarPropType } from './constants';
import EditorSidebarHeader from './header';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarRegion from 'layout/sidebar/region';
import EditorActionBar from 'post-editor/editor-action-bar';
import EditorDeletePost from 'post-editor/editor-delete-post';
import EditorDrawer from 'post-editor/editor-drawer';
import EditorRevisionsList from 'post-editor/editor-revisions-list';

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
		isPostPrivate: PropTypes.bool,
		confirmationSidebarStatus: PropTypes.string,
		nestedSidebar: NestedSidebarPropType,
		setNestedSidebar: PropTypes.func,
		loadRevision: PropTypes.func,
		selectedRevisionId: PropTypes.number,
		selectRevision: PropTypes.func,
	}

	headerToggleSidebar = () => {
		if ( this.props.nestedSidebar === NESTED_SIDEBAR_NONE ) {
			this.props.toggleSidebar();
		} else {
			this.props.setNestedSidebar( NESTED_SIDEBAR_NONE );
		}
	}

	render() {
		const {
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
			confirmationSidebarStatus,
			nestedSidebar,
			setNestedSidebar,
			loadRevision,
			selectedRevisionId,
			selectRevision,
		} = this.props;

		const sidebarClassNames = classNames(
			'editor-sidebar',
			{ 'is-nested-sidebar-focused': nestedSidebar !== NESTED_SIDEBAR_NONE }
		);

		return (
			<div className={ sidebarClassNames } >
				<EditorSidebarHeader nestedSidebar={ nestedSidebar } toggleSidebar={ this.headerToggleSidebar } />
				<EditorActionBar
					isNew={ isNew }
					post={ post }
					savedPost={ savedPost }
					site={ site }
					type={ type }
				/>
				<SidebarRegion className="editor-sidebar__parent-region">
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
						confirmationSidebarStatus={ confirmationSidebarStatus }
						setNestedSidebar={ setNestedSidebar }
						selectRevision={ selectRevision }
					/>
				</SidebarRegion>
				<SidebarRegion className="editor-sidebar__nested-region">
					{ nestedSidebar === NESTED_SIDEBAR_REVISIONS &&
						<EditorRevisionsList
							loadRevision={ loadRevision }
							selectedRevisionId={ selectedRevisionId }
							selectRevision={ selectRevision }
						/>
					}
				</SidebarRegion>
				<SidebarFooter>
					{ nestedSidebar === NESTED_SIDEBAR_NONE && (
						<EditorDeletePost post={ post } onTrashingPost={ onTrashingPost } />
					) }
				</SidebarFooter>
			</div>
		);
	}
}
