import React from 'react';

import './progress-line-style.scss';

const ProgressLine = ( { statusText } ) => {
	return (
		<div className="progress-line__container">
			<div className="progress-line__status-text-container">
				<h2 className="progress-line__status-text"> { statusText } </h2>
			</div>
			<div className="progress-line__loading-container">
				<div className="progress-line__loading-loader" />
			</div>
		</div>
	);
};

export default ProgressLine;
