/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import hasInitializedSites from 'state/selectors/has-initialized-sites';
import SiteTypeForm from './form';
import StepWrapper from 'signup/step-wrapper';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { submitSiteType } from 'state/signup/steps/site-type/actions';
import { saveSignupStep } from 'state/signup/progress/actions';
import Button from 'components/button';

const siteTypeToFlowname = {
	'online-store': 'ecommerce-onboarding',
};

class SiteType extends Component {
	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	submitStep = siteTypeValue => {
		this.props.submitSiteType( siteTypeValue );

		// Modify the flowname if the site type matches an override.
		this.props.goToNextStep( siteTypeToFlowname[ siteTypeValue ] || this.props.flowName );
	};

	renderImportButton = () => {
		if ( 'import' === this.props.flowName ) {
			return null;
		}

		return (
			<div className="site-type__import-button">
				<Button borderless onClick={ this.props.goToNextStep.bind( this, 'import' ) }>
					{ this.props.translate( 'Already have a website?' ) }
				</Button>
			</div>
		);
	};

	renderContent = () => (
		<Fragment>
			<SiteTypeForm submitForm={ this.submitStep } siteType={ this.props.siteType } />
			{ this.renderImportButton() }
		</Fragment>
	);

	render() {
		const {
			flowName,
			positionInFlow,
			signupProgress,
			stepName,
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
				stepContent={ this.renderContent() }
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
	{ saveSignupStep, submitSiteType }
)( localize( SiteType ) );
