/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import BetaTesting from 'calypso/my-sites/beta-testing/main';

export const betaTesting = ( context, next ) => {
	context.primary = <BetaTesting />;
	next();
};
