/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

export default React.createClass( {
	displayName: 'JetpackInstallStep',

	render() {
		return (
			<Card className="jetpack-connect__install-step">
				<div className="jetpack-connect__install-step-title">
					{ this.props.title }
				</div>
				<div className="jetpack-connect__install-step-text">
					{ this.props.text }
				</div>
					{ this.props.example }
			</Card>
		);
	}
} );
