/**
 * External dependencies
 */
import React from 'react';

const JetpackLogo = ( { size } ) => {
	const svgPath = 'M42,0A42,42,0,1,0,84,42,42,42,0,0,0,42,0ZM40.36,' +
		'51.81,27.17,48.45a5.21,5.21,0,0,1-3.23-7.65L40.36,' +
		'12.35Zm20.32-8.6L44.27,71.65V32.19l13.19,3.36A5.21,5.21,0,0,1,60.69,43.2Z';

	return (
		<svg
			className="jetpack-logo"
			height={ size }
			width={ size }
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 84 84"
		>
			<path d={ svgPath } />
		</svg>
	);
};
export default JetpackLogo;
