/**
 * External dependencies
 */
import type { ReactNode } from 'react';

/**
 * WordPress dependencies
 */
import { Card, CardBody } from '@wordpress/components';

export default function DataViewsCard( { children }: { children: ReactNode } ) {
	return (
		<Card className="dataviews-card">
			<CardBody>{ children }</CardBody>
		</Card>
	);
}
