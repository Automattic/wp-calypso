/**
 * External dependencies
 */
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import React from 'react';

const debug = debugFactory( 'calypso:me:security:2fa-status' );

export default localize( React.createClass( {

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
					? this.props.translate(
						'{{status}}Status:{{/status}} Two-Step Authentication is currently {{onOff}}on{{/onOff}}.',
						{
							components: {
								status: <span className="security-2fa-status__heading" />,
								onOff: <span className="security-2fa-status__on" />
							}
						}
					)
					: this.props.translate(
						'{{status}}Status:{{/status}} Two-Step Authentication is currently {{onOff}}off{{/onOff}}.',
						{
							components: {
								status: <span className="security-2fa-status__heading" />,
								onOff: <span className="security-2fa-status__off" />
							}
						}
					)
				}
			</p>
		);
	}
} ) );
