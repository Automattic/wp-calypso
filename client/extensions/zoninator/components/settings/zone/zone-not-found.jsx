/**
 * External dependencies
 */
import React from 'react';
import { PropTypes } from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';

const ZoneNotFound = ( { translate } ) => (
	<EmptyContent
		title={ translate( 'Zone not found' ) }
		line={ translate( 'The zone you\'re trying to access doesn\'t exist.' ) } />
);

ZoneNotFound.propTypes = {
	translate: PropTypes.func.isRequired,
};

export default localize( ZoneNotFound );
