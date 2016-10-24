/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';

function PostTypeForbidden( { translate } ) {
	return (
		<EmptyContent
			illustration="/calypso/images/drake/drake-whoops.svg"
			title={ translate( 'You need permission to manage this post type' ) }
			line={ translate( 'Ask your site administrator to grant you access' ) } />
	);
}

PostTypeForbidden.propTypes = {
	translate: PropTypes.func
};

export default localize( PostTypeForbidden );
