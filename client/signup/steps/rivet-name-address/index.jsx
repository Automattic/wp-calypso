/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import StepWrapper from 'signup/step-wrapper';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { setSiteTitle } from 'state/signup/steps/site-title/actions';
import { getRivetAddress } from 'state/signup/steps/rivet-name-address/selectors';
import { setRivetAddress } from 'state/signup/steps/rivet-name-address/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';

/**
 * Style dependencies
 */
import './style.scss';

class RivetNameAddress extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		recordTracksEvent: PropTypes.func.isRequired,
		rivetAddress: PropTypes.string,
		setRivetAddress: PropTypes.func.isRequired,
		setSiteTitle: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		siteTitle: PropTypes.string,
		stepName: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	handleInputChange = action => ( { currentTarget: { value = '' } } ) =>
		this.props[ action ]( value );

	handleSubmit = event => {
		event.preventDefault();

		const { flowName, rivetAddress, siteTitle, stepName } = this.props;

		this.props.setRivetAddress( rivetAddress );
		this.props.setSiteTitle( siteTitle );
		this.props.submitSignupStep( { stepName, flowName }, { rivetAddress, siteTitle } );
		// @todo: continue tracking this event? track a new event with both values?
		this.props.recordTracksEvent( 'calypso_signup_actions_submit_site_title', {
			value: siteTitle,
		} );
		this.props.goToNextStep();
	};

	renderNameAddressForm = () => {
		const { rivetAddress, siteTitle } = this.props;

		return (
			<div className="rivet-name-address__wrapper">
				<form>
					<div className="rivet-name-address__field-control rivet-name-address__title">
						<FormFieldset>
							<FormTextInput
								id="title"
								name="title"
								placeholder=""
								onChange={ this.handleInputChange( 'setSiteTitle' ) }
								value={ siteTitle }
								maxLength={ 100 }
								autoFocus // eslint-disable-line jsx-a11y/no-autofocus
								aria-label="Business Name"
							/>
							<FormTextInput
								id="address"
								name="address"
								placeholder=""
								onChange={ this.handleInputChange( 'setRivetAddress' ) }
								value={ rivetAddress }
								maxLength={ 800 }
								aria-label="Business Address"
							/>
							<Button primary type="submit" onClick={ this.handleSubmit }>
								{ this.props.translate( 'Continue' ) }
							</Button>{' '}
						</FormFieldset>
					</div>
				</form>
			</div>
		);
	};

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				fallbackHeaderText={ this.props.translate( 'Create your site.' ) }
				signupProgress={ this.props.signupProgress }
				stepContent={ this.renderNameAddressForm() }
			/>
		);
	}
}

export default connect(
	state => ( {
		rivetAddress: getRivetAddress( state ),
		siteTitle: getSiteTitle( state ),
	} ),
	{
		saveSignupStep,
		recordTracksEvent,
		setRivetAddress,
		setSiteTitle,
		submitSignupStep,
	}
)( localize( RivetNameAddress ) );
