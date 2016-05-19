/**
 * External dependencies
 */
import React from 'react';
import find from 'lodash/find';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import signupUtils from 'signup/utils';

export default React.createClass( {
	displayName: 'PreviousStepButton',

	propTypes: {
		flowName: React.PropTypes.string.isRequired,
		stepName: React.PropTypes.string.isRequired,
		previousPath: React.PropTypes.string,
		positionInFlow: React.PropTypes.number.isRequired,
		signupProgressStore: React.PropTypes.array.isRequired
	},

	backUrl() {
		if ( this.props.backUrl ) {
			return this.props.backUrl;
		}

		const previousStepName = signupUtils.getPreviousStepName( this.props.flowName, this.props.stepName ),
			{ stepSectionName } = find( this.props.signupProgressStore, { stepName: previousStepName } );

		return signupUtils.getStepUrl( this.props.flowName, previousStepName, stepSectionName, i18n.getLocaleSlug() );
	},

	recordClick() {
		analytics.tracks.recordEvent( 'calypso_signup_previous_step_button_click', {
			flow: this.props.flowName,
			step: this.props.stepName
		} );
	},

	render() {
		if ( this.props.positionInFlow > 0 ) {
			return (
				<a className="previous-step" href={ this.backUrl() } onClick={ this.recordClick }>
					<span className="previous-step__label">
						{ this.translate( 'Back' ) }
					</span>
				</a>
			);
		}

		return null;
	}
} );
