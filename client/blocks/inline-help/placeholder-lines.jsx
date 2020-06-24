/**
 * External dependencies
 */
import React from 'react';
import { times } from 'lodash';

export default ( { lines = 4 } ) => (
	<ul className="inline-help__results-placeholder">
		{ times( lines, ( n ) => (
			<li key={ `line-${ n }` } className="inline-help__results-placeholder-item" />
		) ) }
	</ul>
);
