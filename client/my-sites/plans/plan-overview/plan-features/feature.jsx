/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import SectionHeader from 'components/section-header';

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
			<CompactCard className="plan-features__feature">
				<div className="plan-features__feature-description">
					<strong>{ this.props.heading }</strong>
					<em>{ this.props.description }</em>
				</div>

				{ this.props.button &&
					<Button
						className="plan-features__feature-button"
						onClick={ this.props.button.onClick }
						primary>
						{ this.props.button.label }
					</Button>
				}
			</CompactCard>
		);
	}
} );

export default PlanFeature;
