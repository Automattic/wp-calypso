/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

const PlanFeatureRedesign = React.createClass( {

	render() {
		const { title } = this.props;

		return (
			<li className="plan-feature--redesign"><Gridicon size={ 18 } icon="checkmark" />{ title }</li>
		);
	}

} );

export default PlanFeatureRedesign;
