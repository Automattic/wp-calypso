/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import i18n, { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import { setSiteType } from 'state/signup/steps/site-type/actions';
import { getSiteType } from 'state/signup/steps/site-type/selectors';

//Form components
import Card from 'components/card';
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';

class SiteType extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			siteType: props.siteType,
		};
	}

	handleRadioChange = event => this.setState( { siteType: event.currentTarget.value } );

	handleSubmit = event => {
		event.preventDefault();
		// Default siteType is 'blogger'
		this.props.submitStep( this.state.siteType || 'blogger' );
	};

	renderContent() {
		const { translate } = this.props;

		return (
			<div className="site-type__wrapper">
				<div className="site-type__form-wrapper">
					<form onSubmit={ this.handleSubmit }>
						<Card>
							<h3>{ translate( 'Pick the option that best describes you' ) }</h3>
							<FormFieldset>
								<FormLabel className="site-type__option">
									<FormRadio
										value="blogger"
										checked={ 'blogger' === this.state.siteType }
										onChange={ this.handleRadioChange }
									/>
									<span>
										<strong>Blogger</strong>
										<span>Share your story with a collection of posts.</span>
									</span>
								</FormLabel>

								<FormLabel className="site-type__option">
									<FormRadio
										value="business"
										checked={ 'business' === this.state.siteType }
										onChange={ this.handleRadioChange }
									/>
									<span>
										<strong>Business</strong>
										<span>Promote your products or services.</span>
									</span>
								</FormLabel>

								<FormLabel className="site-type__option">
									<FormRadio
										value="professional"
										checked={ 'professional' === this.state.siteType }
										onChange={ this.handleRadioChange }
									/>
									<span>
										<strong>Professional</strong>
										<span>Showcase your portfolio, skills, or work.</span>
									</span>
								</FormLabel>

								<FormLabel className="site-type__option">
									<FormRadio
										value="educator"
										checked={ 'educator' === this.state.siteType }
										onChange={ this.handleRadioChange }
									/>
									<span>
										<strong>Educator</strong>
										<span>Share school projects or classroom information.</span>
									</span>
								</FormLabel>

								<FormLabel className="site-type__option">
									<FormRadio
										value="non-profit"
										checked={ 'non-profit' === this.state.siteType }
										onChange={ this.handleRadioChange }
									/>
									<span>
										<strong>Non-profit Organization</strong>
										<span>Raise money or awareness for a case.</span>
									</span>
								</FormLabel>
							</FormFieldset>

							<div className="site-type__submit-wrapper">
								<Button primary={ true } type="submit">
									{ translate( 'Continue' ) }
								</Button>
							</div>
						</Card>
					</form>
				</div>
			</div>
		);
	}

	render() {
		const { flowName, positionInFlow, signupProgress, stepName, translate } = this.props;

		const headerText = translate( 'What type of website do you need?' );
		const subHeaderText = translate(
			'WordPress can do it all, but you probably have something more specific in mind.'
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
			/>
		);
	}
}

export default connect(
	state => ( {
		siteType: getSiteType( state ),
	} ),
	( dispatch, ownProps ) => ( {
		submitStep: siteTypeValue => {
			dispatch( setSiteType( siteTypeValue ) );
			// Create site
			SignupActions.submitSignupStep(
				{
					processingMessage: i18n.translate( 'Collecting your information' ),
					stepName: ownProps.stepName,
				},
				[],
				{
					siteType: siteTypeValue,
				}
			);
			ownProps.goToNextStep( ownProps.flowName );
		},
	} )
)( localize( SiteType ) );
