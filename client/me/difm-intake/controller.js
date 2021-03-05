/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DifmIntake from './main';

const intake = ( context, next ) => {
	context.primary = <DifmIntake />;
	next();
};

export default {
	intake,
};
