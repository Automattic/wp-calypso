/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { NESTED_SIDEBAR_NONE, NESTED_SIDEBAR_REVISIONS } from 'state/ui/editor/sidebar/constants';
import Button from 'components/button';
import EditorPostType from 'post-editor/editor-post-type';

const EditorSidebarHeader = ( {
	nestedSidebar = NESTED_SIDEBAR_NONE,
	closeSidebar,
	translate,
} ) => (
	<div className="editor-sidebar__header">
		{ nestedSidebar === NESTED_SIDEBAR_REVISIONS && (
			<span>
				<Button
					borderless
					className="editor-sidebar__header-title"
					onClick={ closeSidebar }
					title={ translate( 'Close sidebar' ) }
				>
					<EditorPostType isSettings />
				</Button>
				<span>→ { translate( 'Revisions' ) }</span>
			</span>
		) }

		{ nestedSidebar === NESTED_SIDEBAR_NONE && <EditorPostType isSettings /> }

		<Button
			compact
			borderless
			className="editor-sidebar__back"
			onClick={ closeSidebar }
			title={ translate( 'Close sidebar' ) }
		>
			<Gridicon icon="cross" />
		</Button>
	</div>
);

EditorSidebarHeader.propTypes = {
	translate: PropTypes.func.isRequired,
	closeSidebar: PropTypes.func,
	nestedSidebar: PropTypes.oneOf( [ NESTED_SIDEBAR_NONE, NESTED_SIDEBAR_REVISIONS ] ),
};

export default localize( EditorSidebarHeader );
