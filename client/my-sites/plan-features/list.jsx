/**
 * External dependencies
 */
import React, { Component } from 'react';

class PlanFeaturesItemList extends Component {

	render() {
		return (
			<ul className="plan-features__item-list">
				{ this.props.children }
			</ul>
		);
	}
}

export default PlanFeaturesItemList;
