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

function EditorSidebarHeader( { translate, toggleSidebar } ) {
	return (
		<div className="editor-sidebar__header">
			<EditorPostType isSettings />
			<Button
				compact borderless
				className="editor-sidebar__back"
				onClick={ toggleSidebar }
				title={ translate( 'Close sidebar' ) }
				aria-label={ translate( 'Close sidebar' ) }>
				<Gridicon icon="cross" />
			</Button>
		</div>
	);
}

EditorSidebarHeader.propTypes = {
	translate: PropTypes.func,
	toggleSidebar: PropTypes.func,
};

export default localize( EditorSidebarHeader );
