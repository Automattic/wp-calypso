/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import StickyPanel from 'components/sticky-panel';

const ActionHeader = ( { children } ) => {
	// TODO: Implement breadcrumbs component.

	return (
		<StickyPanel>
			<Card className="components__action-header">
				<span>Breadcrumbs > go > here</span>
				<div className="components__action-header-actions">
					{ children }
				</div>
			</Card>
		</StickyPanel>
	);
};

export default ActionHeader;

