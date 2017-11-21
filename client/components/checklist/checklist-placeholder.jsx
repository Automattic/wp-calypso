/**
 * External dependencies
 *
 * @format
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

export default function ChecklistPlaceholder() {
	return (
		<Card compact className="checklist__task is-placeholder">
			<div className="checklist__task-primary">
				<h5 className="checklist__task-title">Task title</h5>
				<p className="checklist__task-description">This is an example</p>
				<small className="checklist__task-duration">Estimated time</small>
			</div>
			<div className="checklist__task-secondary" />
		</Card>
	);
}
