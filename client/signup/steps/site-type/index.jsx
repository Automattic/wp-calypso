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
import Button from 'components/button';

import { setSiteType } from 'state/signup/steps/site-type/actions';

import { translate } from 'i18n-calypso';

const SiteTypeStep = React.createClass( {
	propTypes: {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setSiteType: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	},

	submitSiteTypeStep( siteType ) {
		this.props.setSiteType( siteType );

		SignupActions.submitSignupStep( {
			processingMessage: translate( 'Setting up your site' ),
			stepName: this.props.stepName,
			siteType
		}, [], { siteType } );

		this.props.goToNextStep();
	},

    submitBusiness() {
        this.submitSiteTypeStep( "business" );
    },

    submitPersonal() {
        this.submitSiteTypeStep( "personal" );
    },

	skipStep() {
		this.submitSiteTypeStep( '' );
	},

	renderSiteTypeStep() {
		return (
			<div className="site-type__wrapper">
				<Button onClick={ this.submitBusiness } primary>Business</Button>
                <Button onClick={ this.submitPersonal } primary>Personal</Button>
			</div>
		);
	},
	render() {
		const headerText = translate( 'Welcome to WordPress.' );
		const subHeaderText = translate( 'What kind of site can we help you set up?' );

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
					stepContent={ this.renderSiteTypeStep() }
					goToNextStep={ this.skipStep }
				/>
			</div>
		);
	}
} );

export default connect(
	null,
	{ setSiteType }
)( SiteTypeStep );
