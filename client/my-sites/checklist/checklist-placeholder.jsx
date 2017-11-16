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
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Card compact className="checklist-task is-placeholder">
			<div className="checklist-task__primary">
				<h5 className="checklist-task__title">Task title</h5>
				<p className="checklist-task__description">This is an example</p>
				<small className="checklist-task__duration">Estimated time</small>
			</div>
			<div className="checklist-task__secondary" />
		</Card>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
