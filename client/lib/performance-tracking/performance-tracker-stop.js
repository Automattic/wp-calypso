/**
 * External dependencies
 */
import { useEffect } from 'react';
import { stop } from '@automattic/browser-data-collector';

/**
 * Internal dependencies
 */
import config from 'config';

export function usePerformanceTrackerStop( pageId ) {
	useEffect( () => {
		if ( config.isEnabled( 'rum-tracking/logstash' ) ) {
			stop( pageId );
		}
	}, [ pageId ] );
}
