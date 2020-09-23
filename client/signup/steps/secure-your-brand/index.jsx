/**
 * External dependencies
 */

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSiteBySlug } from 'state/sites/selectors';
import StepWrapper from 'signup/step-wrapper';
import GutenboardingHeader from 'my-sites/plans-features-main/gutenboarding-header';
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import hasInitializedSites from 'state/selectors/has-initialized-sites';
import { CompactCard, Card, Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

export class SecureYourBrandStep extends Component {
	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	onSelectAdd = ( cartItem ) => {
		const { additionalStepData, stepSectionName, stepName } = this.props;

		this.props.recordTracksEvent( 'calypso_signup_brand_upsell' );

		const step = {
			stepName,
			stepSectionName,
			cartItem,
			...additionalStepData,
		};

		this.props.submitSignupStep( step, {
			cartItem,
		} );
		this.props.goToNextStep();
	};

	getDomainName() {
		return this.props.domainItem && this.props.domainItem.meta;
	}

	handleFreePlanButtonClick = () => {
		this.onSelectAdd( null ); // onUpgradeClick expects a cart item -- null means Free Plan.
	};

	getGutenboardingHeader() {
		// launch flow coming from Gutenboarding
		if ( this.props.flowName === 'new-launch' ) {
			const { headerText, subHeaderText } = this.props;

			return (
				<GutenboardingHeader
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					onFreePlanSelect={ this.handleFreePlanButtonClick }
				/>
			);
		}

		return null;
	}

	recommendedDomains() {
		return (
			<div className="secure-your-brand">
				<Card>Domains</Card>
				<CompactCard>
					<Button>Help</Button>
				</CompactCard>
			</div>
		);
	}

	render() {
		const {
			flowName,
			stepName,
			positionInFlow,
			translate,
			hasInitializedSitesBackUrl,
		} = this.props;

		const subHeaderText = translate(
			'Secure your name and save 20% with our Domain signup bundle'
		);
		const headerText = translate( 'Secure your name' );

		return (
			<div className="secure-your-brand__step-secton-wrapper">
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					headerText={ headerText }
					fallbackHeaderText={ headerText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ subHeaderText }
					isWideLayout={ true }
					stepContent={ this.recommendedDomains() }
					allowBackFirstStep={ !! hasInitializedSitesBackUrl }
					backUrl={ 'TBD' }
					backLabelText={ translate( 'Back' ) }
					hideFormattedHeader={ !! this.getGutenboardingHeader() }
				/>
			</div>
		);
	}
}

SecureYourBrandStep.propTypes = {
	additionalStepData: PropTypes.object,
	goToNextStep: PropTypes.func.isRequired,
	selectedSite: PropTypes.object,
	stepName: PropTypes.string.isRequired,
	stepSectionName: PropTypes.string,
	customerType: PropTypes.string,
	translate: PropTypes.func.isRequired,
	flowName: PropTypes.string,
};

export default connect(
	( state, { signupDependencies: { siteSlug, domainItem } } ) => ( {
		selectedSite: siteSlug ? getSiteBySlug( state, siteSlug ) : null,
		hasInitializedSitesBackUrl: hasInitializedSites( state ) ? '/sites/' : false,
		domainItem,
	} ),
	{ recordTracksEvent, saveSignupStep, submitSignupStep }
)( localize( SecureYourBrandStep ) );
