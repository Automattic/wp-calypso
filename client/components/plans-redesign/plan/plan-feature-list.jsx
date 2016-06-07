/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PlanFeatureRedesign from './plan-feature';

const PlanFeatureListRedesign = React.createClass( {

	render() {
		const { slug, features } = this.props;

		return (
			<ul className="plan-feature-list--redesign">
				{
					features.map( ( feature, ind ) =>
						<PlanFeatureRedesign title={ feature.title } key={ `feature_${ slug }-${ ind }` } />
					)
				}
			</ul>
		);
	}

} );

export default PlanFeatureListRedesign;
