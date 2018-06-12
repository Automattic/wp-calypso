/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import Card from 'components/card';
import Button from 'components/button';
import SignupActions from 'lib/signup/actions';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormInputValidation from 'components/forms/form-input-validation';
import ExternalLink from 'components/external-link';

class CloneDestinationStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		signupDependencies: PropTypes.object,
	};

	state = {
		form: {
			destinationSiteName: '',
			destinationSiteUrl: '',
		},
		formErrors: {
			destinationSiteName: false,
			destinationSiteUrl: false,
		},
	};

	handleFieldChange = ( { target: { name, value } } ) =>
		this.setState( {
			form: Object.assign( {}, this.state.form, { [ name ]: value } ),
			formErrors: { ...this.state.formErrors, [ name ]: false },
		} );

	goToNextStep = () => {
		const { translate } = this.props;
		const {
			form: { destinationSiteName, destinationSiteUrl },
		} = this.state;

		const errors = Object.assign(
			! destinationSiteName && {
				destinationSiteName: translate( 'Please provide a name for your site.' ),
			},
			! destinationSiteUrl && {
				destinationSiteUrl: translate( 'Please provide the destination URL.' ),
			}
		);

		if ( isEmpty( errors ) ) {
			SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {
				destinationSiteName,
				destinationSiteUrl,
			} );

			this.props.goToNextStep();
		} else {
			this.setState( { formErrors: errors } );
		}
	};

	renderStepContent = () => {
		const { translate } = this.props;
		const { formErrors } = this.state;

		return (
			<Card className="clone-destination__card">
				<svg
					className="clone-destination__image"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 512.7 180.4"
				>
					<g className="clone-destination__destination">
						<path
							fill="#FFFFFF"
							d="M299.4,178.9V15.2c0-6.8,5.5-12.4,12.4-12.4h183.3c6.8,0,12.4,5.5,12.4,12.4V179H299.4V178.9z"
						/>
						<path
							fill="#00A6DB"
							d="M299.4,35.2V14.7c0-8.1,5.5-14.7,12.4-14.7h183.3c6.8,0,12.4,6.6,12.4,14.7v20.5H299.4z"
						/>
						<path fill="#74DCFC" d="M322,80.8h65.8v66c0,5.7-4.7,10.4-10.4,10.4H322V80.8z" />
						<path
							fill="#00BE28"
							d="M387.8,146.8v-6.2c-3.3-7.7-9.1-12-16.7-14.1c-13.8-3.9-36.4,4.3-49.1-24.1v54.8h55.4 C383.1,157.2,387.8,152.5,387.8,146.8z"
						/>
						<circle fill="#FFFFFF" cx="369.2" cy="100.9" r="8.1" />
						<path fill="#E0E8ED" d="M404.4,157.2H465c7.3,0,13.2-5.9,13.2-13.2v-30.8h-73.8V157.2z" />
						<rect x="404.4" y="80.8" fill="#E0E8ED" width="73.8" height="20.1" />
						<path
							fill="#C8D7E2"
							d="M316.4,61.8c3.3-1.5,6.7-2.8,10.1-3.8c3.5-0.9,7-1.8,10.6-2.4c7.1-1.2,14.3-1.8,21.6-1.9 c7.2-0.1,14.4,0.2,21.6,1c7.2,0.7,14.3,1.7,21.3,2.7s14.1,1.8,21.2,2.3s14.2,0.8,21.3,1c7.1,0.2,14.2-0.1,21.2-0.9 c7-0.8,14-2.2,21.1-3.5c0.3-0.1,0.7,0.2,0.7,0.5c0.1,0.3-0.1,0.6-0.5,0.7c-6.9,2-13.9,3.6-21,4.8c-7.1,1-14.4,1.5-21.6,1.5 s-14.4-0.3-21.6-0.7s-14.3-1.2-21.5-2.1c-7.1-0.9-14.2-2-21.3-2.8c-3.5-0.4-7.1-0.8-10.6-1s-7.1-0.3-10.6-0.3 c-7.1,0-14.2,0.4-21.2,1.2c-7.1,0.7-14,2.2-20.8,4.3c-0.2,0-0.3-0.1-0.4-0.2C316.2,62,316.3,61.9,316.4,61.8L316.4,61.8z"
						/>
						<path
							fill="#BBCDDA"
							d="M510,178.3l-52.8,0.2h-43.8l-87.6,0.1H312c-1,0-2.1-0.2-3.1-0.4c-6.3-1.6-10.7-7.3-10.7-13.8v-54.8v-75h3.7 l0.1,75.1v54.8c0,4.8,3.2,9.1,7.9,10.3c0.8,0.2,1.5,0.3,2.3,0.3h13.7l87.5,0.1h43.8l51.3,0.2l0.3-33.4l0.2-17.4l0.3-17.4 c0.1-0.3,0.3-0.5,0.7-0.5c0.2,0,0.4,0.2,0.5,0.5l0.3,17.4l0.3,17.4l0.4,34.8C511.4,177.5,510.8,178.2,510,178.3L510,178.3 L510,178.3z"
						/>
						<path
							fill="#004F84"
							d="M510.8,35.5c-8.9,1.2-17.9,1.9-26.8,2.2c-9,0.3-17.9,0.3-26.9,0.4c-17.9,0.2-35.8,0.3-53.7,0.4 c-17.9,0.1-35.8-0.1-53.7-0.4c-9-0.1-17.9-0.1-26.9-0.4c-9-0.3-18-1-26.9-2.2V34c8.9-1.2,17.9-1.9,26.9-2.2 c8.9-0.3,17.9-0.3,26.9-0.4c17.9-0.2,35.8-0.3,53.7-0.4s35.8,0.1,53.7,0.4c9,0.1,17.9,0.1,26.9,0.4s18,1,26.9,2.2v1.5H510.8z"
						/>
					</g>
					<g className="clone-destination__dots">
						<circle fill="#C8D7E2" cx="238.8" cy="94.1" r="5.2" />
						<circle fill="#C8D7E2" cx="261.9" cy="94.1" r="5.2" />
						<circle fill="#C8D7E2" cx="284.5" cy="94.1" r="5.2" />
					</g>
					<g className="clone-destination__origin">
						<path
							fill="#FFFFFF"
							d="M3.4,178.9V15.2c0-6.8,5.5-12.4,12.4-12.4h183.3c6.8,0,12.4,5.5,12.4,12.4V179H3.4V178.9z"
						/>
						<path
							fill="#00A6DB"
							d="M3.4,35.2V14.7C3.4,6.6,8.9,0,15.8,0h183.3c6.8,0,12.4,6.6,12.4,14.7v20.5H3.4z"
						/>
						<path fill="#74DCFC" d="M26,80.8h65.8v66c0,5.7-4.7,10.4-10.4,10.4H26V80.8z" />
						<path
							fill="#00BE28"
							d="M91.8,146.8v-6.2c-3.3-7.7-9.1-12-16.7-14.1c-13.8-3.9-36.4,4.3-49.1-24.1v54.8h55.4 C87.1,157.2,91.8,152.5,91.8,146.8z"
						/>
						<circle fill="#FFFFFF" cx="73.2" cy="100.9" r="8.1" />
						<path
							fill="#E0E8ED"
							d="M108.4,157.2l60.6,0.1c7.3,0,13.2-5.9,13.2-13.2l0-30.8l-73.8-0.1L108.4,157.2z"
						/>
						<rect
							x="135.3"
							y="54"
							transform="matrix(1.164952e-03 -1 1 1.164952e-03 54.3135 236.0769)"
							fill="#E0E8ED"
							width="20.1"
							height="73.8"
						/>
						<path
							fill="#C8D7E2"
							d="M20.4,61.8c3.3-1.5,6.7-2.8,10.1-3.8c3.5-0.9,7-1.8,10.6-2.4c7.1-1.2,14.3-1.8,21.6-1.9 c7.2-0.1,14.4,0.2,21.6,1c7.2,0.7,14.3,1.7,21.3,2.7s14.1,1.8,21.2,2.3c7.1,0.5,14.2,0.8,21.3,1s14.2-0.1,21.2-0.9 c7.1-0.8,14.1-2.2,21.1-3.5c0.3-0.1,0.7,0.2,0.7,0.5c0.1,0.3-0.1,0.6-0.4,0.7c-6.9,2-13.9,3.6-21,4.8c-7.1,1-14.4,1.5-21.6,1.5 c-7.2,0-14.4-0.3-21.6-0.7S112.2,61.9,105,61s-14-2-21.1-2.7c-3.5-0.4-7.1-0.8-10.6-1S66.2,57,62.7,57c-7.1,0-14.2,0.4-21.2,1.2 c-7.1,0.7-14,2.2-20.8,4.3c-0.2,0-0.3-0.1-0.4-0.2C20.2,62,20.3,61.9,20.4,61.8L20.4,61.8z"
						/>
						<path
							fill="#BBCDDA"
							d="M214,178.3l-52.8,0.2h-43.8l-87.6,0.1H16.1c-1,0-2.1-0.2-3.1-0.4c-6.3-1.6-10.7-7.3-10.7-13.8v-54.8v-75H6v75 v54.8c0,4.8,3.2,9.1,7.9,10.3c0.8,0.2,1.5,0.3,2.3,0.3h13.7l87.6,0.1h43.8l51.3,0.2l0.3-33.4l0.2-17.4l0.3-17.4 c0.1-0.3,0.3-0.5,0.7-0.5c0.2,0,0.4,0.2,0.5,0.5l0.3,17.4l0.3,17.4l0.4,34.8C215.4,177.5,214.8,178.2,214,178.3L214,178.3 L214,178.3z"
						/>
						<path
							fill="#004F84"
							d="M214.8,35.5c-8.9,1.2-17.9,1.9-26.8,2.2c-8.9,0.3-17.9,0.3-26.9,0.4c-17.9,0.2-35.8,0.3-53.7,0.4 s-35.8-0.1-53.7-0.4c-9-0.1-17.9-0.1-26.9-0.4c-9-0.3-18-1-26.9-2.2V34c8.9-1.2,17.9-1.9,26.9-2.2c8.9-0.3,17.9-0.3,26.9-0.4 c17.9-0.2,35.8-0.3,53.7-0.4s35.8,0.1,53.7,0.4c8.9,0.1,17.9,0.1,26.9,0.4s18,1,26.9,2.2L214.8,35.5L214.8,35.5z"
						/>
					</g>
				</svg>

				<FormLabel className="clone-destination__label">Destination site title</FormLabel>
				<FormTextInput
					name="destinationSiteName"
					onChange={ this.handleFieldChange }
					isError={ !! formErrors.destinationSiteName }
				/>
				{ formErrors.destinationSiteName && (
					<FormInputValidation isError={ true } text={ formErrors.destinationSiteName } />
				) }

				<FormLabel className="clone-destination__label">Destination site URL</FormLabel>
				<FormTextInput
					name="destinationSiteUrl"
					onChange={ this.handleFieldChange }
					isError={ !! formErrors.destinationSiteUrl }
				/>
				{ formErrors.destinationSiteUrl && (
					<FormInputValidation isError={ true } text={ formErrors.destinationSiteUrl } />
				) }

				<p className="clone-destination__tos">
					{ translate( 'By continuing, you agree to our {{TOS /}}', {
						components: {
							TOS: (
								<ExternalLink
									className="clone-destination__tos-link"
									href="https://wordpress.com/tos/"
									target="_blank"
								>
									{ translate( 'Terms of Service.' ) }
								</ExternalLink>
							),
						},
					} ) }
				</p>

				<Button primary className="clone-destination__button" onClick={ this.goToNextStep }>
					{ translate( 'Continue' ) }
				</Button>
			</Card>
		);
	};

	render() {
		const { flowName, stepName, positionInFlow, signupProgress, translate } = this.props;

		const headerText = translate( 'Getting started' );
		const subHeaderText = translate(
			"Let's get started. What would you like to name your destination site and where is it located?"
		);

		return (
			<StepWrapper
				className="clone-destination"
				flowName={ flowName }
				stepName={ stepName }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ subHeaderText }
				fallbackSubHeaderText={ subHeaderText }
				positionInFlow={ positionInFlow }
				signupProgress={ signupProgress }
				stepContent={ this.renderStepContent() }
			/>
		);
	}
}

export default localize( CloneDestinationStep );
