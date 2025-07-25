/**
 * External dependencies
 */
import type { FC } from 'react';
import React from 'react';

interface ChartErrorProps {
	message: string;
	details?: string;
}

/**
 * Error display component for chart rendering issues
 * @param root0
 * @param root0.message
 * @param root0.details
 */
export const ChartError: FC< ChartErrorProps > = ( { message, details } ) => (
	<div className="chart-error">
		<strong>Chart Error:</strong> { message }
		{ details && (
			<details>
				<summary>Show Details</summary>
				<pre>{ details }</pre>
			</details>
		) }
	</div>
);
