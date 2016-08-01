/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';

const SiteTitle = React.createClass( {
	displayName: 'Site Title',

	renderSiteTitleStep() {
		return (
			<div className="site-title__section-wrapper">

			</div>
		);
	},
	render() {
		return (
			<div>
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ this.translate( 'What is your site title?' ) }
					subHeaderText={ this.translate( 'WordPress.com is the best place for your WordPress blog or website.' ) }
					signupProgressStore={ this.props.signupProgressStore }
					stepContent={ this.renderSiteTitleStep() }/>
			</div>
		);
	}
} );

export default SiteTitle;
