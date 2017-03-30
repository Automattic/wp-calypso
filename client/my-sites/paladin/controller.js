/**
 * External Dependencies
 */
import React from 'react';

import PaladinComponent from './main';

module.exports = {
	activate: function(context, next) {
	    context.primary = React.createElement( PaladinComponent );
		next();
	}
};

