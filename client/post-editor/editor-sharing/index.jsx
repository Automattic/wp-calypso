/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import PublicizeOptions from './publicize-options';
import SharingLikeOptions from './sharing-like-options';

export default function EditorSharing( { post, site } ) {
	return (
		<div className="editor-sharing">
			<PublicizeOptions post={ post } site={ site } />
			<SharingLikeOptions post={ post } site={ site } />
		</div>
	);
}

EditorSharing.propTypes = {
	site: PropTypes.object,
	post: PropTypes.object
};
