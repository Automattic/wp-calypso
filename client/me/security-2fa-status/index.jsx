/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:me:security:2fa-status' );

class Security2faStatus extends React.Component {
	static displayName = 'Security2faStatus';

	componentDidMount() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	}

	render() {
		return (
			<p>
				{ this.props.twoStepEnabled
					? this.props.translate(
							'{{status}}Status:{{/status}} Two-Step Authentication is currently {{onOff}}on{{/onOff}}.',
							{
								components: {
									status: <span className="security-2fa-status__heading" />,
									onOff: <span className="security-2fa-status__on" />,
								},
							}
					  )
					: this.props.translate(
							'{{status}}Status:{{/status}} Two-Step Authentication is currently {{onOff}}off{{/onOff}}.',
							{
								components: {
									status: <span className="security-2fa-status__heading" />,
									onOff: <span className="security-2fa-status__off" />,
								},
							}
					  ) }
			</p>
		);
	}
}

export default localize( Security2faStatus );
