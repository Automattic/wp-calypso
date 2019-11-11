/**
 * External dependencies
 */

import React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

const OfflineStatus = () => (
	<span className="offline-status">
		<svg
			className="gridicon"
			height={ 18 }
			width={ 18 }
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
		>
			<g>
				<path d="M12.736 3.184L7.834 12.57l5.106.035-2.592 7.904 7.265-10.502-5.65.083.773-6.906z" />
			</g>
		</svg>
		Offline
	</span>
);

export default OfflineStatus;
