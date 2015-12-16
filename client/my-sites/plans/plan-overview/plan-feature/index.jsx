/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';

const PlanFeature = ( { button, description, heading } ) => {
	return (
		<CompactCard className="plan-feature">
			<div className="plan-feature__description">
				<strong>{ heading }</strong>
				<em>{ description }</em>
			</div>
			{ button &&
				<Button
					className="plan-feature__button"
					href={ button.href }
					primary>
					{ button.label }
				</Button>
			}
		</CompactCard>
	);
};

PlanFeature.propTypes = {
	button: React.PropTypes.shape( {
		label: React.PropTypes.string.isRequired,
		href: React.PropTypes.string
	} ),
	description: React.PropTypes.string.isRequired,
	heading: React.PropTypes.string.isRequired
};

export default PlanFeature;
