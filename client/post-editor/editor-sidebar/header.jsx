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

function EditorSidebarHeader( { childSidebar = null, toggleSidebar, translate } ) {
	return (
		<div className="editor-sidebar__header">
			{ childSidebar === 'revisions' && (
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

			{ childSidebar === null && (
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
	childSidebar: PropTypes.string,
	toggleSidebar: PropTypes.func,
	translate: PropTypes.func,
};

export default localize( EditorSidebarHeader );
