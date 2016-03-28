import React from 'react';

// This is a React class because code-under-test may want to assign a ref to it. Can't do that with a pure function.
export default React.createClass( {
	render: function() {
		return <div />;
	}
} );
