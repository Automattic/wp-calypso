/**
 * External dependencies
 */
import React from 'react';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { preventWidows } from 'lib/formatting';

export default React.createClass( {
	displayName: 'JetpackInstallStep',

	renderText() {
		let { text, action } = this.props;

		if ( ! action || ! React.isValidElement( action ) ) {
			text = preventWidows( text );
		} else if ( 1 === React.Children.count( action.props.children ) ) {
			action = React.cloneElement(
				action,
				omit( action.props, 'children' ),
				React.Children.map( action.props.children, child => {
					return preventWidows( child );
				} )
			);
		}

		return (
			<span>{ text } { action }</span>
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
