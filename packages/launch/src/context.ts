/**
 * External dependencies
 */
import * as React from 'react';

interface LaunchContext {
	siteId: number;
}

const LaunchContext = React.createContext< LaunchContext >( {
	siteId: 0,
} );

export default LaunchContext;
