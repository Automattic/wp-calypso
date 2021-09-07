import React from 'react';

export default ( { lines = 4 } ) => (
	<div className="inline-help__results-placeholder">
		{ Array.from( { length: lines }, ( _, n ) => (
			<div key={ `line-${ n }` } className="inline-help__results-placeholder-item" />
		) ) }
	</div>
);
