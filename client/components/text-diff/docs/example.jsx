/** @format */
/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import TextDiff from 'components/text-diff';

export default function TextDiffExample() {
	const changes = [
		{
			op: 'del',
			value: 'Old Title.',
		},
		{
			op: 'add',
			value: 'New Title!',
		},
	];

	return (
		<h2>
			<TextDiff changes={ changes } />
		</h2>
	);
}

TextDiffExample.displayName = 'TextDiffExample';
