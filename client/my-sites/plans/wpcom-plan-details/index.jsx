/**
 * External dependencies
 */
import React from 'react';

const WpcomPlanDetails = React.createClass( {
	render: function() {
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
