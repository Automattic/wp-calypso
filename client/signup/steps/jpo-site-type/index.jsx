/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import Card from 'components/card';
import Button from 'components/button';
import { translate } from 'i18n-calypso';

import { getJPOSiteTitle } from 'state/signup/steps/jpo-site-title/selectors';
import { setJPOSiteType } from 'state/signup/steps/jpo-site-type/actions';

const JPOSiteTypeStep = React.createClass( {
	propTypes: {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setJPOSiteType: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	},

	skipStep() {
		this.props.goToNextStep();
	},

	renderStepContent() {
		return (
			<div className="jpo__site-type-wrapper">
				<div className="jpo__site-type-row">
					<Card>
						<Button>{ translate( 'Start with a blog' ) }</Button>
						<div className="jpo__site-type-description">{ translate( 'To share your ideas, stories, and photographs with your followers.' ) }</div>
					</Card>
					<Card>
						<Button>{ translate( 'Start with a website' ) }</Button>
						<div className="jpo__site-type-description">{ translate( 'To promote your business, organization, or brand and connect with your audience.' ) }</div>
					</Card>
				</div>
				<div className="jpo__site-type-row">
					<Card>
						<Button>{ translate( 'Start with a portfolio' ) }</Button>
						<div className="jpo__site-type-description">{ translate( 'To present your creative projects in a visual showcase.' ) }</div>
					</Card>
					<Card>
						<Button>{ translate( 'Start with an online store' ) }</Button>
						<div className="jpo__site-type-description">{ translate( 'To sell your products or services and accept payments.' ) }</div>
					</Card>
				</div>
				<div className="jpo__site-type-note">{ translate( 'Not sure? Pick the closest option. You can always change your settings later.' ) }</div>
			</div>
		);
	},

	render() {
		var siteName = getJPOSiteTitle();

		const headerText = translate( 'Let\'s shape ' ) + siteName + translate( '.' );
		const subHeaderText = translate( 'What kind of site do you need? Choose an option below:' );

		return (
			<div>
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ headerText }
					fallbackHeaderText={ headerText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ subHeaderText }
					signupProgress={ this.props.signupProgress }
					stepContent={ this.renderStepContent() }
					goToNextStep={ this.skipStep }
				/>
			</div>
		);
	}
} );

export default connect(
	null,
	{ setJPOSiteType }
)( JPOSiteTypeStep );