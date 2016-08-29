/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PlanPrice from '../';

export default React.createClass( {
	displayName: 'PlanPrice',

	render() {
		return (
			<div className="docs__design-assets-group">
				<h2>
					<a href="/devdocs/blocks/plan-price">Plan Price</a>
				</h2>

				<h3>Plan with standard price</h3>
				<PlanPrice rawPrice={ 99 } />

				<h3>Plan with discounted price</h3>
				<span style={ { display: 'flex' } }>
					<PlanPrice rawPrice={ 8.25 } original />
					<PlanPrice rawPrice={ 2.25 } discounted />
				</span>
			</div>
		);
	}
} );

