/**
 * External dependencies
 */
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { stop } from '@automattic/browser-data-collector';

/**
 * Internal dependencies
 */
import config from 'config';
import { getSectionName } from 'state/ui/selectors';

const PerformanceTrackerStop = ( { sectionName } ) => {
	useEffect( () => {
		if ( config.isEnabled( 'rum-tracking/logstash' ) ) {
			stop( sectionName );
		}
	}, [ sectionName ] );

	// Nothing to render, this component is all about side effects
	return null;
};

const mapStateToProps = ( state ) => {
	const sectionName = getSectionName( state );
	return {
		sectionName,
	};
};

export default connect( mapStateToProps )( PerformanceTrackerStop );
