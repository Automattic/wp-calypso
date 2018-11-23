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
import { allSiteTypes, getSiteTypePropertyValue } from 'lib/signup/site-type';
import { recordTracksEvent } from 'state/analytics/actions';

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

	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	handleRadioChange = event => this.setState( { siteType: event.currentTarget.value } );

	handleSubmit = event => {
		event.preventDefault();
		// Default siteType is 'blog'
		const siteTypeInputVal =
			this.state.siteType || getSiteTypePropertyValue( 'id', 'blog', 'slug' );
		const themeRepo =
			getSiteTypePropertyValue( 'slug', siteTypeInputVal, 'theme' ) ||
			'pub/independent-publisher-2';

		this.props.submitStep( siteTypeInputVal, themeRepo );
	};

	renderRadioOptions() {
		return allSiteTypes.map( siteTypeProperties => (
			<FormLabel className="site-type__option" key={ siteTypeProperties.id }>
				<FormRadio
					value={ siteTypeProperties.slug }
					checked={ siteTypeProperties.slug === this.state.siteType }
					onChange={ this.handleRadioChange }
				/>
				<span>
					<strong>{ siteTypeProperties.label }</strong>
					<span>{ siteTypeProperties.description }</span>
				</span>
			</FormLabel>
		) );
	}

	renderContent() {
		const { translate } = this.props;

		return (
			<div className="site-type__wrapper">
				<div className="site-type__form-wrapper">
					<form onSubmit={ this.handleSubmit }>
						<Card>
							<FormFieldset>{ this.renderRadioOptions() }</FormFieldset>

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
			dispatch(
				recordTracksEvent( 'calypso_signup_actions_submit_site_type', {
					value: siteTypeValue,
				} )
			);

			let nextFlowName = ownProps.flowName;
			if ( siteTypeValue === getSiteTypePropertyValue( 'id', 'store', 'slug' ) ) {
				nextFlowName = 'ecommerce';
			} else if ( 'ecommerce' === ownProps.flowName && ownProps.previousFlowName ) {
				nextFlowName = ownProps.previousFlowName;
			}

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
			ownProps.goToNextStep( nextFlowName );
		},
	} )
)( localize( SiteType ) );
