/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

const ServerConnectionIndicatorPlaceholder = () => {
	return (
		<Card className="server-connection-indicator__placeholder">
			<div className="server-connection-indicator__placeholder-body">
				<svg
					viewBox="0 0 100 100"
					xmlns="http://www.w3.org/2000/svg"
					className="server-connection-indicator__placeholder-image "
				>
					<circle cx="50" cy="50" r="50" />
				</svg>
			</div>
		</Card>
	);
};

export default ServerConnectionIndicatorPlaceholder;
