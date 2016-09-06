/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import { getEditURL } from 'lib/posts/utils';

const EditButton = ( { post, site, size, translate } ) => {
	const editUrl = getEditURL( post, site );
	return (
		<a className="edit-button" href={ editUrl }>
			<Gridicon icon="pencil" size={ size } className="edit-button__icon" />
			<span className="edit-button__label">{ translate( 'Edit' ) }</span>
		</a>
	);
};

EditButton.propTypes = {
	post: React.PropTypes.object.isRequired,
	site: React.PropTypes.object.isRequired,
	size: React.PropTypes.number
};

EditButton.defaultProps = {
	size: 24
};

export default localize( EditButton );
