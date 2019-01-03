/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import { submitSiteType } from 'state/signup/steps/site-type/actions';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { allSiteTypes, getSiteTypePropertyValue } from 'lib/signup/site-type';
import { recordTracksEvent } from 'state/analytics/actions';

//Form components
import Card from 'components/card';
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';

/**
 * Style dependencies
 */
import './style.scss';

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

		this.props.submitStep( siteTypeInputVal );
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

		const headerText = translate( 'Start with a site type' );
		const subHeaderText = '';

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
			dispatch( submitSiteType( siteTypeValue ) );

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

			ownProps.goToNextStep( nextFlowName );
		},
	} )
)( localize( SiteType ) );
