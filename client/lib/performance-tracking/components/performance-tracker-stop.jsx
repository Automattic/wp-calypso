/**
 * External dependencies
 */
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { stop } from '@automattic/browser-data-collector';

/**
 * Internal dependencies
 */
import config from 'config';

const PerformanceTrackerStop = ( { id } ) => {
	useEffect( () => {
		if ( config.isEnabled( 'rum-tracking/logstash' ) ) {
			stop( id );
		}
	} );

	// Nothing to render, this component is all about side effects
	return null;
};

PerformanceTrackerStop.propTypes = {
	id: PropTypes.string.isRequired,
};

export default PerformanceTrackerStop;
