import { localize } from 'i18n-calypso';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import hasInitializedSites from 'calypso/state/selectors/has-initialized-sites';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';
import { submitSiteType } from 'calypso/state/signup/steps/site-type/actions';
import { getSiteType } from 'calypso/state/signup/steps/site-type/selectors';
import SiteTypeForm from './form';

const siteTypeToFlowname = {
	import: 'import-onboarding',
	'online-store': 'ecommerce',
};

class SiteType extends Component {
	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	handleImportFlowClick = () => {
		this.props.recordTracksEvent( 'calypso_signup_import_cta_click', {
			flow: this.props.flowName,
			step: this.props.stepName,
		} );
		this.submitStep( 'import' );
	};

	submitStep = ( siteTypeValue ) => {
		const { stepName } = this.props;

		this.props.submitSiteType( siteTypeValue, stepName );

		// Modify the flowname if the site type matches an override.
		let flowName;
		if ( 'import-onboarding' === this.props.flowName ) {
			flowName = siteTypeToFlowname[ siteTypeValue ] || 'onboarding';
		} else if (
			( 'design-first' === this.props.flowName ||
				'ecommerce-design-first' === this.props.flowName ) &&
			'site-type-with-theme' === stepName
		) {
			flowName = 'online-store' === siteTypeValue ? 'ecommerce-design-first' : this.props.flowName;
		} else {
			flowName = siteTypeToFlowname[ siteTypeValue ] || this.props.flowName;
		}

		this.props.goToNextStep( flowName );
	};

	renderStepContent() {
		const { siteType } = this.props;

		return (
			<Fragment>
				<SiteTypeForm
					goToNextStep={ this.props.goToNextStep }
					submitForm={ this.submitStep }
					siteType={ siteType }
				/>
			</Fragment>
		);
	}

	render() {
		const { flowName, positionInFlow, stepName, translate, hasInitializedSitesBackUrl } =
			this.props;

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
				stepContent={ this.renderStepContent() }
				allowBackFirstStep={ !! hasInitializedSitesBackUrl }
				backUrl={ hasInitializedSitesBackUrl }
				backLabelText={ hasInitializedSitesBackUrl ? translate( 'Back to Sites' ) : null }
			/>
		);
	}
}

export default connect(
	( state ) => ( {
		siteType: getSiteType( state ) || 'blog',
		hasInitializedSitesBackUrl: hasInitializedSites( state ) ? '/sites/' : false,
	} ),
	{ recordTracksEvent, saveSignupStep, submitSiteType }
)( localize( SiteType ) );
