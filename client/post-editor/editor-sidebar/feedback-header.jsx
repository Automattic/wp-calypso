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

// TODO: Consider merging this with EditorSidebarHeader depending on final design
export function FeedbackSidebarHeader( { translate, closeFeedback } ) {
	return (
		<div className="editor-sidebar__header">
			<EditorPostType isSettings />
			<Gridicon icon="arrow-right" />
			{ translate( 'Share Draft' ) }
			<Button
				compact
				borderless
				className="editor-sidebar__back"
				onClick={ closeFeedback }
				title={ translate( 'Close feedback' ) }
				aria-label={ translate( 'Close feedback' ) }
			>
				<Gridicon icon="cross" />
			</Button>
		</div>
	);
}

FeedbackSidebarHeader.propTypes = {
	translate: PropTypes.func.isRequired,
	closeFeedback: PropTypes.func.isRequired,
};

export default localize( FeedbackSidebarHeader );
