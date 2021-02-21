/**
 * External dependencies
 */
import React from 'react';
import { times } from 'lodash';

export default ( { lines = 4 } ) => (
	<div className="inline-help__results-placeholder">
		{ times( lines, ( n ) => (
			<div key={ `line-${ n }` } className="inline-help__results-placeholder-item" />
		) ) }
	</div>
);
