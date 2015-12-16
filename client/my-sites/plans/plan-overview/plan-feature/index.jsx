/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';

const PlanFeature = React.createClass( {
	propTypes: {
		button: React.PropTypes.shape( {
			label: React.PropTypes.string.isRequired,
			onClick: React.PropTypes.func.isRequired
		} ),
		description: React.PropTypes.string.isRequired,
		heading: React.PropTypes.string.isRequired
	},

	render() {
		return (
			<CompactCard className="plan-feature">
				<div className="plan-feature__description">
					<strong>{ this.props.heading }</strong>
					<em>{ this.props.description }</em>
				</div>

				{ this.props.button &&
					<Button
						className="plan-feature__button"
						href={ this.props.button.href }
						primary>
						{ this.props.button.label }
					</Button>
				}
			</CompactCard>
		);
	}
} );

export default PlanFeature;
