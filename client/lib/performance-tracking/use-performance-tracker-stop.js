/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { stop } from '@automattic/browser-data-collector';

/**
 * Internal dependencies
 */
import { getSectionName } from 'state/ui/selectors';
import config from 'config';

export function usePerformanceTrackerStop() {
	const sectionName = useSelector( getSectionName );

	useEffect( () => {
		if ( config.isEnabled( 'rum-tracking/logstash' ) ) {
			stop( sectionName );
		}
	}, [ sectionName ] );
}
