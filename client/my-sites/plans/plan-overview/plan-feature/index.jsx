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
			<div>
				<strong className="plan-feature__heading">{ heading }</strong>
				<span>{ description }</span>
			</div>
			{ button &&
				<Button
					className="plan-feature__button"
					href={ button.href }
					compact>
					{ button.label }
				</Button>
			}
		</CompactCard>
	);
};

PlanFeature.propTypes = {
	button: React.PropTypes.shape( {
		label: React.PropTypes.string.isRequired,
		href: React.PropTypes.string.isRequired
	} ),
	description: React.PropTypes.string.isRequired,
	heading: React.PropTypes.string.isRequired
};

export default PlanFeature;
