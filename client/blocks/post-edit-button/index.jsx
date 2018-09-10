/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import GridiconPencil from 'gridicons/dist/pencil';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import { getEditURL } from 'state/posts/utils';

const PostEditButton = ( { post, site, iconSize, onClick, translate } ) => {
	const editUrl = getEditURL( post, site );
	return (
		<a className="post-edit-button" href={ editUrl } onClick={ onClick }>
			<GridiconPencil size={ iconSize } className="post-edit-button__icon" />
			<span className="post-edit-button__label">{ translate( 'Edit' ) }</span>
		</a>
	);
};

PostEditButton.propTypes = {
	post: PropTypes.object.isRequired,
	site: PropTypes.object.isRequired,
	iconSize: PropTypes.number,
	onClick: PropTypes.func,
};

PostEditButton.defaultProps = {
	iconSize: 24,
};

export default localize( PostEditButton );
