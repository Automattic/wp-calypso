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
import { getThemeForSiteType } from 'signup/utils';
import { allSiteTypes, dasherize, isValidLandingPageSiteType } from 'lib/signup/site-type';

//Form components
import Card from 'components/card';
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';

class SiteType extends Component {
	constructor( props ) {
		super( props );
		const siteTypeVal = isValidLandingPageSiteType( props.siteType ) ? props.siteType : '';
		this.state = {
			siteType: siteTypeVal,
		};
	}

	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	handleRadioChange = event => this.setState( { siteType: event.currentTarget.value } );

	handleSubmit = event => {
		event.preventDefault();
		// Default siteType is 'blogger'
		const siteTypeInputVal = this.state.siteType || allSiteTypes[ 0 ].type;
		const themeRepo = getThemeForSiteType( siteTypeInputVal );

		this.props.submitStep( siteTypeInputVal, themeRepo );
	};

	renderContent() {
		const { translate } = this.props;
		const radioOptions = allSiteTypes.map( elem => (
			<FormLabel className="site-type__option" key={ elem.type }>
				<FormRadio
					value={ elem.type }
					checked={ dasherize( elem.type ) === dasherize( this.state.siteType ) }
					onChange={ this.handleRadioChange }
				/>
				<span>
					<strong>{ elem.type }</strong>
					<span>{ elem.description }</span>
				</span>
			</FormLabel>
		) );

		return (
			<div className="site-type__wrapper">
				<div className="site-type__form-wrapper">
					<form onSubmit={ this.handleSubmit }>
						<Card>
							<FormFieldset>{ radioOptions }</FormFieldset>

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
		submitStep: ( siteTypeValue, themeRepo ) => {
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
					themeSlugWithRepo: themeRepo,
				}
			);
			ownProps.goToNextStep( ownProps.flowName );
		},
	} )
)( localize( SiteType ) );
