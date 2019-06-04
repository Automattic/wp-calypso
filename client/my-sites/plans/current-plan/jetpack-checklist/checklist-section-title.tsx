/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

const ChecklistSectionTitle: FunctionComponent< { excludeFromCount: true; title: string } > = ( {
	title,
} ) => (
	<Card className="jetpack-checklist__task-section-title" compact>
		<h2>{ title }</h2>
	</Card>
);

export default ChecklistSectionTitle;
