/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Style dependencies
 */
import './style.scss';

const ScanHistoryPlaceholder: FunctionComponent = () => {
	return (
		<div className="scan-history-placeholder history">
			<h1 className="scan-history-placeholder__header history__header">History</h1>
			<p className="scan-history-placeholder__content">
				The scanning history contains a record of all previously active threats on your site.
			</p>
		</div>
	);
};

export default ScanHistoryPlaceholder;
