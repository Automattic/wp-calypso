/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';

class ReaderLandingStep extends Component {
	render() {
		const { flowName, positionInFlow, signupProgress, stepName, translate } = this.props;

		return (
			<div className="reader-landing">
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					headerText={ translate( 'Create an account and start using the Reader' ) }
					subHeaderText={ translate(
						'Migrate from email subscriptions to using the WordPress.com Reader ' +
							'and notifications so as to keep updated on your favorite sites.'
					) }
					signupProgress={ signupProgress }
					stepContent={ null }
				/>
			</div>
		);
	}
}

export default connect( null )( localize( ReaderLandingStep ) );
