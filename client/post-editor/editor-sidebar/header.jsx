/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import EditorPostType from 'post-editor/editor-post-type';
import {
	CHILD_SIDEBAR_NONE,
	CHILD_SIDEBAR_REVISIONS,
	ChildSidebarPropTypes,
} from './util';

function EditorSidebarHeader( { childSidebar = CHILD_SIDEBAR_NONE, toggleSidebar, translate } ) {
	return (
		<div className="editor-sidebar__header">
			{ childSidebar === CHILD_SIDEBAR_REVISIONS && (
				<span>
					<Button
						borderless
						className="editor-sidebar__parent-title"
						onClick={ toggleSidebar }
						title={ translate( 'Close sidebar' ) }
					>
						<EditorPostType isSettings />
					</Button>
					<span>
						→ { translate( 'Revisions' ) }
					</span>
				</span>
			) }

			{ childSidebar === CHILD_SIDEBAR_NONE && (
				<EditorPostType isSettings />
			) }

			<Button
				compact borderless
				className="editor-sidebar__back"
				onClick={ toggleSidebar }
				title={ translate( 'Close sidebar' ) }
			>
				<Gridicon icon="cross" />
			</Button>
		</div>
	);
}

EditorSidebarHeader.propTypes = {
	childSidebar: ChildSidebarPropTypes,
	toggleSidebar: PropTypes.func,
	translate: PropTypes.func,
};

export default localize( EditorSidebarHeader );
