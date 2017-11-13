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
import { setNestedSidebar, closeEditorSidebar } from 'state/ui/editor/sidebar/actions';
import { getNestedSidebarTarget } from 'state/ui/editor/sidebar/selectors';
import EditorDrawer from 'post-editor/editor-drawer';
import EditorSidebarHeader from './header';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarRegion from 'layout/sidebar/region';
import EditorActionBar from 'post-editor/editor-action-bar';
import EditorDeletePost from 'post-editor/editor-delete-post';
import { NESTED_SIDEBAR_NONE, NestedSidebarPropType } from './constants';

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
		nestedSidebar: NestedSidebarPropType,
		setNestedSidebar: PropTypes.func,
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
					/>
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
