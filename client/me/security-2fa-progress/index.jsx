/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:me:security:2fa-progress' );
import ProgressItem from './progress-item';

const Security2faProgress = React.createClass( {
	displayName: 'Security2faProgress',

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	},

	stepClass: function( step ) {
		var currentStep = parseInt( this.props.step, 10 );

		return {
			isHighlighted: step === currentStep,
			isCompleted: step < currentStep,
		};
	},

	render: function() {
		return (
			<div className="security-2fa-progress__container">
				<div className="security-2fa-progress__inner-container">
					<ProgressItem
						label={ this.props.translate( 'Enter Phone Number' ) }
						icon="phone"
						step={ this.stepClass( 1 ) }
					/>

					<ProgressItem
						label={ this.props.translate( 'Verify Code' ) }
						icon="send-to-phone"
						step={ this.stepClass( 2 ) }
					/>

					<ProgressItem
						label={ this.props.translate( 'Generate Backup Codes' ) }
						icon="refresh"
						step={ this.stepClass( 3 ) }
					/>
				</div>
			</div>
		);
	},
} );

export default localize( Security2faProgress );
