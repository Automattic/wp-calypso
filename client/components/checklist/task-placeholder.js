/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';

export default function TaskPlaceholder() {
	return (
		<Card compact className="checklist__task is-placeholder">
			<div className="checklist__task-primary">
				<h3 className="checklist__task-title">Task title</h3>
				<p className="checklist__task-description">This is an example</p>
				<small className="checklist__task-duration">Estimated time</small>
			</div>
		</Card>
	);
}
