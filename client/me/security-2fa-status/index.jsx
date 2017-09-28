/**
 * External dependencies
 */
import React from 'react';

import debugFactory from 'debug';
const debug = debugFactory( 'calypso:me:security:2fa-status' );

module.exports = React.createClass( {

	displayName: 'Security2faStatus',

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	},

	render: function() {
		return (
			<p>
				{
					this.props.twoStepEnabled
					? this.translate(
						'{{status}}Status:{{/status}} Two-Step Authentication is currently {{onOff}}on{{/onOff}}.',
						{
							components: {
								status: <span className="security-2fa-status__heading"/>,
								onOff: <span className="security-2fa-status__on"/>
							}
						}
					)
					: this.translate(
						'{{status}}Status:{{/status}} Two-Step Authentication is currently {{onOff}}off{{/onOff}}.',
						{
							components: {
								status: <span className="security-2fa-status__heading"/>,
								onOff: <span className="security-2fa-status__off"/>
							}
						}
					)
				}
			</p>
		);
	}
} );
