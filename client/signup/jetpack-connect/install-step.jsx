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
					<span>{ this.props.text }</span> <span>{ this.props.action ? this.props.action : '' }</span>
				</div>
					{ this.props.example }
			</Card>
		);
	}
} );
