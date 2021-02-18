/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'calypso/components/empty-content';
import { settingsPath } from '../../../app/util';

const ZoneNotFound = ( { siteSlug, translate } ) => (
	<EmptyContent
		title={ translate( 'Zone not found' ) }
		line={ translate( "The zone you're trying to access doesn't exist." ) }
		action={ translate( 'Add new' ) }
		actionURL={ `${ settingsPath }/new/${ siteSlug }` }
	/>
);

ZoneNotFound.propTypes = {
	siteSlug: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

export default localize( ZoneNotFound );
