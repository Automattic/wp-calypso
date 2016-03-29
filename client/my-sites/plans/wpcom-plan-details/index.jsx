/**
 * External dependencies
 */
import React from 'react';

const WpcomPlanDetails = React.createClass( {
	propTypes: {
		comparePlansUrl: React.PropTypes.string.isRequired,
		handleLearnMoreClick: React.PropTypes.func.isRequired,
		plan: React.PropTypes.object.isRequired
	},

	render() {
		return (
			<div>
				<p>{ this.props.plan.description }</p>
				<a href={ this.props.comparePlansUrl } onClick={ this.props.handleLearnMoreClick }
					className="plan__learn-more">{ this.translate( 'Learn more', { context: 'Find out more details about a plan' } ) }</a>
			</div>
		);
	}
} );

export default WpcomPlanDetails;
