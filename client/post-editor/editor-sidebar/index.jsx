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
import EditorActionBar from 'post-editor/editor-action-bar';
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
	}

	constructor() {
		super();
		this.toggleChildSidebar = this.toggleChildSidebar.bind( this );
		this.state = {
			childSidebar: null,
		};
	}

	toggleChildSidebar( name ) {
		this.setState( {
			childSidebar: name,
		} );
	}

	get hasChildSidebar() {
		return this.state.childSidebar !== null;
	}

	render() {
		const { toggleSidebar, isNew, onTrashingPost, onPublish, onSave, post, savedPost, site, type, setPostDate } = this.props;

		const headerToggleSidebar = this.hasChildSidebar
			? partial( this.toggleChildSidebar, null )
			: toggleSidebar;

		const sidebarClassNames = classNames(
			'post-editor__sidebar',
			{ 'focus-child': this.hasChildSidebar }
		);

		return (
			<div className={ sidebarClassNames }>
				<EditorSidebarHeader
					childSidebar={ this.state.childSidebar }
					toggleSidebar={ headerToggleSidebar }
				/>
				<EditorActionBar
					isNew={ isNew }
					post={ post }
					savedPost={ savedPost }
					site={ site }
					type={ type }
				/>
				<div className="editor-sidebar__parent">
					<EditorDrawer
						site={ site }
						savedPost={ savedPost }
						post={ post }
						isNew={ isNew }
						type={ type }
						setPostDate={ setPostDate }
						onPrivatePublish={ onPublish }
						onSave={ onSave }
						toggleChildSidebar={ this.toggleChildSidebar }
					/>
					<SidebarFooter>
						<EditorDeletePost
							post={ post }
							onTrashingPost={ onTrashingPost }
						/>
					</SidebarFooter>
				</div>
				<div className="editor-sidebar__child">
					{
						this.hasChildSidebar
							? <EditorRevisionsList />
							: null
					}
				</div>
			</div>
		);
	}

}
