/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { PropTypes, Component } from 'react';
import { partial } from 'lodash';

/**
 * Internal dependencies
 */
import EditorDrawer from 'post-editor/editor-drawer';
import EditorRevisionsList from 'post-editor/editor-revisions-list';
import EditorSidebarHeader from './header';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarRegion from 'layout/sidebar/region';
import EditorActionBar from 'post-editor/editor-action-bar';
import EditorDeletePost from 'post-editor/editor-delete-post';
import { CHILD_SIDEBAR_NONE, ChildSidebarPropTypes } from './util';

export default class EditorSidebar extends Component {
	// TODO: functional component

	static propTypes = {
		savedPost: PropTypes.object,
		post: PropTypes.object,
		isNew: PropTypes.bool,
		onSave: PropTypes.func,
		onPublish: PropTypes.func,
		onTrashingPost: PropTypes.func,
		site: PropTypes.object,
		type: PropTypes.string,
		childSidebar: ChildSidebarPropTypes,
		loadRevision: PropTypes.func,
		selectedRevisionId: PropTypes.number,
		toggleRevision: PropTypes.func,
		toggleChildSidebar: PropTypes.func,
		toggleSidebar: PropTypes.func,
		setPostDate: PropTypes.func,
	}

	render() {
		const { toggleSidebar, isNew, onTrashingPost, onPublish, onSave, post, savedPost, site, type, setPostDate } = this.props;

		const headerToggleSidebar = this.props.childSidebar === CHILD_SIDEBAR_NONE
			? toggleSidebar
			: partial( this.props.toggleChildSidebar, CHILD_SIDEBAR_NONE );

		const sidebarClassNames = classNames(
			'post-editor__sidebar',
			{ 'focus-child': this.props.childSidebar !== CHILD_SIDEBAR_NONE }
		);

		return (
			<div className={ sidebarClassNames }>
				<EditorSidebarHeader
					childSidebar={ this.props.childSidebar }
					toggleSidebar={ headerToggleSidebar }
				/>
				<EditorActionBar
					isNew={ isNew }
					post={ post }
					savedPost={ savedPost }
					site={ site }
					type={ type }
				/>
				<SidebarRegion className="editor-sidebar__parent">
					<EditorDrawer
						site={ site }
						savedPost={ savedPost }
						post={ post }
						isNew={ isNew }
						type={ type }
						setPostDate={ setPostDate }
						onPrivatePublish={ onPublish }
						onSave={ onSave }
						toggleChildSidebar={ this.props.toggleChildSidebar }
					/>
				</SidebarRegion>
				<SidebarRegion className="editor-sidebar__child">
					{
						this.props.childSidebar === CHILD_SIDEBAR_NONE
							? null
							: <EditorRevisionsList
								postId={ post.ID }
								siteId={ site.ID }
								loadRevision={ this.props.loadRevision }
								selectedRevisionId={ this.props.selectedRevisionId }
								toggleRevision={ this.props.toggleRevision }
							/>
					}
				</SidebarRegion>
				<SidebarFooter>
					{ this.props.childSidebar === CHILD_SIDEBAR_NONE && (
						<EditorDeletePost
							post={ post }
							onTrashingPost={ onTrashingPost }
						/>
					) }
				</SidebarFooter>
			</div>
		);
	}
}
