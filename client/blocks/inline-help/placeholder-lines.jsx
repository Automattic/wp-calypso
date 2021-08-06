import { times } from 'lodash';
import React from 'react';

export default ( { lines = 4 } ) => (
	<div className="inline-help__results-placeholder">
		{ times( lines, ( n ) => (
			<div key={ `line-${ n }` } className="inline-help__results-placeholder-item" />
		) ) }
	</div>
);
