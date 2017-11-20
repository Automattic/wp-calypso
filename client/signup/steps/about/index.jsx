/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import formState from 'lib/form-state';
import { setSiteTitle } from 'state/signup/steps/site-title/actions';
import { setDesignType } from 'state/signup/steps/design-type/actions';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

//Form components
import Card from 'components/card';
import Button from 'components/button';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';

class AboutStep extends Component {
	componentWillMount() {
		this.formStateController = new formState.Controller( {
			fieldNames: [ 'siteTitle' ],
			validatorFunction: noop,
			onNewState: this.setFormState,
			hideFieldErrorsOnChange: true,
			initialState: {
				siteTitle: {
					value: '',
				},
			},
		} );

		this.setFormState( this.formStateController.getInitialState() );
	}

	setFormState = state => {
		this.setState( { form: state } );
	};

	handleChangeEvent = event => {
		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value,
		} );
	};

	handleSubmit = event => {
		event.preventDefault();
		const { goToNextStep, stepName, translate } = this.props;

		//Defaults
		const themeRepo = 'pub/radcliffe-2',
			designType = 'blog';
		let siteTitleValue = 'Site Title';

		//Inputs
		const siteTitleInput = formState.getFieldValue( this.state.form, 'siteTitle' );

		if ( siteTitleInput !== '' ) {
			siteTitleValue = siteTitleInput;

			this.props.setSiteTitle( siteTitleValue );
			this.props.recordTracksEvent( 'calypso_signup_actions_user_input', {
				field: 'Site title',
				value: siteTitleInput,
			} );
		}

		this.props.setDesignType( designType );

		SignupActions.submitSignupStep(
			{
				processingMessage: translate( 'Collecting your information' ),
				stepName: stepName,
				themeRepo,
				siteTitleValue,
			},
			[],
			{ themeSlugWithRepo: themeRepo, siteTitle: siteTitleValue }
		);

		goToNextStep();
	};

	renderContent() {
		const { translate, siteTitle } = this.props;

		return (
			<form onSubmit={ this.handleSubmit }>
				<Card>
					<FormFieldset>
						<FormLabel htmlFor="siteTitle">What would you like to name your site?</FormLabel>
						<FormTextInput
							id="siteTitle"
							name="siteTitle"
							placeholder="eg: Mel's Diner, Stevie’s Blog, Vail Renovations"
							defaultValue={ siteTitle }
							onChange={ this.handleChangeEvent }
						/>
					</FormFieldset>
				</Card>

				<Button primary={ true } type="submit">
					{ translate( 'Continue' ) }
				</Button>
			</form>
		);
	}

	render() {
		const { flowName, positionInFlow, signupProgress, stepName, translate } = this.props;

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ translate( 'Let’s create a site' ) }
				subHeaderText={ translate(
					'Please answer these questions so we can help you make the site you need.'
				) }
				signupProgress={ signupProgress }
				stepContent={ this.renderContent() }
			/>
		);
	}
}

export default connect(
	state => ( {
		siteTitle: getSiteTitle( state ),
	} ),
	{ setSiteTitle, setDesignType, recordTracksEvent }
)( localize( AboutStep ) );
