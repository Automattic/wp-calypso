/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import flows from 'signup/config/flows';

module.exports = React.createClass( {
	displayName: 'FlowProgressIndicator',

	getFlowLength: function() {
		var flow = flows.getFlow( this.props.flowName );

		return flow.steps.length;
	},

	render: function() {
		if ( this.getFlowLength() > 1 ) {
			return (
				<div className="flow-progress-indicator">{
					this.translate( 'Step %(stepNumber)d of %(stepTotal)d', {
						args: {
							stepNumber: this.props.positionInFlow + 1,
							stepTotal: this.getFlowLength()
						}
					} )
				}</div>
			);
		}

		return null;
	}
} );
