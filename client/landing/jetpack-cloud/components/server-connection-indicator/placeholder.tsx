/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
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
	const translate = useTranslate();

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

				<div className="server-connection-indicator__placeholder-info">
					<h4 className="server-connection-indicator__placeholder-status">
						{ translate( 'Server Status:' ) }
					</h4>
				</div>
			</div>
		</Card>
	);
};

export default ServerConnectionIndicatorPlaceholder;
