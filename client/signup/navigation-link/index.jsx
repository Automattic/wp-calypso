/**
 * External dependencies
 */
import React from 'react';
import find from 'lodash/find';

/**
 * Internal dependencies
 */
import analytics from 'analytics';
import Gridicon from 'components/gridicon';
import { submitSignupStep } from 'lib/signup/actions';
import signupUtils from 'signup/utils';

const NavigationLink = React.createClass( {
	propTypes: {
		goToNextStep: React.PropTypes.func,
		direction: React.PropTypes.string.isRequired,
		flowName: React.PropTypes.string.isRequired,
		positionInFlow: React.PropTypes.number,
		previousPath: React.PropTypes.string,
		signupProgressStore: React.PropTypes.array,
		stepName: React.PropTypes.string.isRequired
	},

	getBackUrl() {
		if ( this.props.direction !== 'back' ) {
			return;
		}

		if ( this.props.getBackUrl ) {
			return this.props.getBackUrl;
		}

		const previousStepName = signupUtils.getPreviousStepName( this.props.flowName, this.props.stepName ),
			{ stepSectionName } = find( this.props.signupProgressStore, { stepName: previousStepName } );

		return signupUtils.getStepUrl( this.props.flowName, previousStepName, stepSectionName );
	},

	handleClick() {
		if ( this.props.direction === 'forward' ) {
			submitSignupStep( { stepName: this.props.stepName }, [], this.props.defaultDependencies );

			this.props.goToNextStep();
		}

		this.recordClick();
	},

	recordClick() {
		const tracksProps = {
			flow: this.props.flowName,
			step: this.props.stepName
		};

		if ( this.props.direction === 'back' ) {
			analytics.tracks.recordEvent( 'calypso_signup_previous_step_button_click', tracksProps );
		}

		if ( this.props.direction === 'forward' ) {
			analytics.tracks.recordEvent( 'calypso_signup_skip_step', tracksProps );
		}
	},

	render() {
		if ( this.props.positionInFlow === 0 && this.props.direction === 'back' ) {
			return null;
		}

		let backGridicon, forwardGridicon, text;

		if ( this.props.direction === 'back' ) {
			backGridicon = <Gridicon icon="chevron-left" size={ 18 } />;
			text = this.translate( 'Back' );
		}

		if ( this.props.direction === 'forward' ) {
			forwardGridicon = <Gridicon icon="chevron-right" size={ 18 } />;
			text = this.translate( 'Skip for now' );
		}

		return (
			<a className="navigation-link" href={ this.getBackUrl() } onClick={ this.handleClick }>
				<span className="navigation-link__label">
					{ backGridicon }
					{ text }
					{ forwardGridicon }
				</span>
			</a>
		);
	}
} );

export default NavigationLink;
