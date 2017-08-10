/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { find } from 'lodash';
import i18n, { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import signupUtils from 'signup/utils';

export default localize(class extends React.Component {
    static displayName = 'PreviousStepButton';

	static propTypes = {
		flowName: PropTypes.string.isRequired,
		stepName: PropTypes.string.isRequired,
		previousPath: PropTypes.string,
		positionInFlow: PropTypes.number.isRequired,
		signupProgress: PropTypes.array.isRequired
	};

	backUrl = () => {
		if ( this.props.backUrl ) {
			return this.props.backUrl;
		}

		const previousStepName = signupUtils.getPreviousStepName( this.props.flowName, this.props.stepName ),
			{ stepSectionName } = find( this.props.signupProgress, { stepName: previousStepName } );

		return signupUtils.getStepUrl( this.props.flowName, previousStepName, stepSectionName, i18n.getLocaleSlug() );
	};

	recordClick = () => {
		analytics.tracks.recordEvent( 'calypso_signup_previous_step_button_click', {
			flow: this.props.flowName,
			step: this.props.stepName
		} );
	};

	render() {
		if ( this.props.positionInFlow > 0 ) {
			return (
			    <a className="previous-step" href={ this.backUrl() } onClick={ this.recordClick }>
					<span className="previous-step__label">
						{ this.props.translate( 'Back' ) }
					</span>
				</a>
			);
		}

		return null;
	}
});
