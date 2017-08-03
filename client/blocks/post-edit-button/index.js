/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import { getEditURL } from 'lib/posts/utils';

const PostEditButton = ( { post, site, iconSize, onClick, translate } ) => {
	const editUrl = getEditURL( post, site );
	return (
		<a className="post-edit-button" href={ editUrl } onClick={ onClick }>
			<Gridicon icon="pencil" size={ iconSize } className="post-edit-button__icon" />
			<span className="post-edit-button__label">{ translate( 'Edit' ) }</span>
		</a>
	);
};

PostEditButton.propTypes = {
	post: React.PropTypes.object.isRequired,
	site: React.PropTypes.object.isRequired,
	iconSize: React.PropTypes.number,
	onClick: React.PropTypes.func
};

PostEditButton.defaultProps = {
	iconSize: 24
};

export default localize( PostEditButton );
