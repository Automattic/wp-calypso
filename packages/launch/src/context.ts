/**
 * External dependencies
 */
import * as React from 'react';

interface LaunchContext {
	siteId: number;
	locale: string;
}

const LaunchContext = React.createContext< LaunchContext >( {
	siteId: 0,
	locale: 'en',
} );

export default LaunchContext;
