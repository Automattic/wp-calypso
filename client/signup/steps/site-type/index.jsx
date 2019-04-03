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
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import { submitSiteType } from 'state/signup/steps/site-type/actions';

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

		const headerText = translate( 'What are we building today?' );
		const subHeaderText = translate(
			'Choose the best starting point for your site. You can add or change features later on.'
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

			if ( siteTypeValue === getSiteTypePropertyValue( 'id', 5, 'slug' ) ) {
				flowName = 'ecommerce-onboarding';
			}

			if ( 'business' === siteTypeValue ) {
				flowName = 'onboarding-for-business';
			}

			goToNextStep( flowName );
		},
	} )
)( localize( SiteType ) );
