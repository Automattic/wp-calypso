/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { NESTED_SIDEBAR_NONE, NESTED_SIDEBAR_REVISIONS, NestedSidebarPropType } from './constants';
import Button from 'components/button';
import EditorPostType from 'post-editor/editor-post-type';

const EditorSidebarHeader = ( { nestedSidebar = NESTED_SIDEBAR_NONE, toggleSidebar, translate } ) => (
	<div className="editor-sidebar__header">
		{ nestedSidebar === NESTED_SIDEBAR_REVISIONS && (
			<span>
				<Button
					borderless
					className="editor-sidebar__header-title"
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

		{ nestedSidebar === NESTED_SIDEBAR_NONE && (
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

EditorSidebarHeader.propTypes = {
	translate: PropTypes.func.isRequired,
	toggleSidebar: PropTypes.func,
	nestedSidebar: NestedSidebarPropType
};

export default localize( EditorSidebarHeader );
