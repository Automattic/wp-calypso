import PropTypes from 'prop-types';

import './progress-line-style.scss';

const ProgressLine = ( { statusText }: { statusText: string } ) => {
	return (
		<div className="progress-line__container">
			<div className="progress-line__status-text-container">
				<h2 className="progress-line__status-text">{ statusText }</h2>
			</div>
			<div className="progress-line__loading-container">
				<div className="progress-line__loading-loader" />
			</div>
		</div>
	);
};

ProgressLine.propType = {
	mailbox: PropTypes.node.isRequired,
};

export default ProgressLine;
