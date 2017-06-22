/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import StickyPanel from 'components/sticky-panel';

const ActionHeader = ( { children, breadcrumbs } ) => {
	// TODO: Implement proper breadcrumbs component.
	// For v1, we will just pass in a prop from each page.
	return (
		<StickyPanel>
			<Card className="action-header__header">
				<span className="action-header__breadcrumbs">{ breadcrumbs }</span>
				<div className="action-header__actions">
					{ children }
				</div>
			</Card>
		</StickyPanel>
	);
};

ActionHeader.propTypes = {
	breadcrumbs: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.node
	] ),
	children: PropTypes.oneOfType( [
		PropTypes.arrayOf( PropTypes.node ),
		PropTypes.node
	] ),
};

export default ActionHeader;
