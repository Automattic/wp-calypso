/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'calypso/components/empty-content';

/**
 * Image dependencies
 */
import whoopsImage from 'calypso/assets/images/illustrations/whoops.svg';

function PostTypeForbidden( { translate } ) {
	return (
		<EmptyContent
			illustration={ whoopsImage }
			title={ translate( 'You need permission to manage this post type' ) }
			line={ translate( 'Ask your site administrator to grant you access' ) }
		/>
	);
}

PostTypeForbidden.propTypes = {
	translate: PropTypes.func,
};

export default localize( PostTypeForbidden );
