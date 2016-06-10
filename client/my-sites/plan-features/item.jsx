/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

class PlanFeaturesItem extends Component {

	render() {
		return (
			<li className="plan-features__item">
				<Gridicon className="plan-features__item-checkmark" size={ 18 } icon="checkmark" />
				{ this.props.children }
			</li>
		);
	}
}

export default PlanFeaturesItem;
