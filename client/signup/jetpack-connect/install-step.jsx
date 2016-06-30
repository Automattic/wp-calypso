/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { preventWidows } from 'lib/formatting';

export default React.createClass( {
	displayName: 'JetpackInstallStep',

	renderText() {
		const { action } = this.props;
		let { text } = this.props;

		if ( ! action ) {
			return (
				<span>
					{ preventWidows( text ) }
				</span>
			);
		}

		return (
			<span>
				{ text }
				<span> </span>
				{ action }
			</span>
		);
	},

	render() {
		return (
			<Card className="jetpack-connect__install-step">
				<div className="jetpack-connect__install-step-title">
					{ this.props.title }
				</div>
				<div className="jetpack-connect__install-step-text">
					{ this.renderText() }
				</div>
				{ this.props.example }
			</Card>
		);
	}
} );
