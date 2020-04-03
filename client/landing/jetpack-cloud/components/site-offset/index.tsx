/**
 * External dependencies
 *
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { SiteOffsetContext } from './context';

export const useSiteOffset = () => {
	return React.useContext( SiteOffsetContext );
};
