/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import hasInitializedSites from 'state/selectors/has-initialized-sites';
import SignupActions from 'lib/signup/actions';
import SiteTypeForm from './form';
import StepWrapper from 'signup/step-wrapper';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { submitSiteType } from 'state/signup/steps/site-type/actions';

const siteTypeToFlowname = {
	'online-store': 'ecommerce-onboarding',
	business: 'onboarding-for-business',
	blog: 'onboarding-blog',
};

class SiteType extends Component {
	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	render() {
		const {
			flowName,
			positionInFlow,
			signupProgress,
			siteType,
			stepName,
			submitStep,
			translate,
			hasInitializedSitesBackUrl,
		} = this.props;

		const headerText = translate( 'What kind of site are you building?' );
		const subHeaderText = translate(
			'This is just a starting point. You can add or change features later.'
		);

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ subHeaderText }
				fallbackSubHeaderText={ subHeaderText }
				signupProgress={ signupProgress }
				stepContent={ <SiteTypeForm submitForm={ submitStep } siteType={ siteType } /> }
				allowBackFirstStep={ !! hasInitializedSitesBackUrl }
				backUrl={ hasInitializedSitesBackUrl }
				backLabelText={ hasInitializedSitesBackUrl ? translate( 'Back to My Sites' ) : null }
			/>
		);
	}
}

export default connect(
	state => ( {
		siteType: getSiteType( state ) || 'blog',
		hasInitializedSitesBackUrl: hasInitializedSites( state ) ? '/sites/' : false,
	} ),
	( dispatch, { goToNextStep, flowName } ) => ( {
		submitStep: siteTypeValue => {
			dispatch( submitSiteType( siteTypeValue ) );

			// Modify the flowname if the site type matches an override.
			goToNextStep( siteTypeToFlowname[ siteTypeValue ] || flowName );
		},
	} )
)( localize( SiteType ) );
