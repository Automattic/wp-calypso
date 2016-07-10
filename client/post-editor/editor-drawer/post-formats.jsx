/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import PostFormatsData from 'components/data/post-formats-data';
import PostFormatsAccordion from 'post-editor/editor-post-formats/accordion';

function EditorDrawerPostFormats( { site, post } ) {
	return (
		<PostFormatsData siteId={ site.ID }>
			<PostFormatsAccordion
				site={ site }
				post={ post }
				className="editor-drawer__accordion" />
		</PostFormatsData>
	);
}

EditorDrawerPostFormats.propTypes = {
	site: PropTypes.object,
	post: PropTypes.object
};

export default EditorDrawerPostFormats;
