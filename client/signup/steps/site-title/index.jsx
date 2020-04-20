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
import StepWrapper from 'signup/step-wrapper';
import { Button } from '@automattic/components';
import FormTextInput from 'components/forms/form-text-input';
import FormFieldset from 'components/forms/form-fieldset';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import { recordTracksEvent } from 'state/analytics/actions';
import { setSiteTitle } from 'state/signup/steps/site-title/actions';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';

/**
 * Style dependencies
 */
import './style.scss';

class SiteTitleStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setSiteTitle: PropTypes.func.isRequired,
		stepName: PropTypes.string,
		translate: PropTypes.func.isRequired,
		siteTitle: PropTypes.string,
		siteVerticalName: PropTypes.string,
		shouldFetchVerticalData: PropTypes.bool,
		siteType: PropTypes.string,
	};

	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	handleInputChange = ( { currentTarget: { value = '' } } ) => this.props.setSiteTitle( value );

	handleSubmit = ( event ) => {
		event.preventDefault();

		const { flowName, siteTitle, stepName } = this.props;

		this.props.setSiteTitle( siteTitle );
		this.props.submitSignupStep( { stepName, flowName }, { siteTitle } );
		this.props.recordTracksEvent( 'calypso_signup_actions_submit_site_title', {
			value: siteTitle,
		} );
		this.props.goToNextStep();
	};

	renderSiteTitleStep = () => {
		const { siteTitle, siteType } = this.props;
		const fieldLabel = getSiteTypePropertyValue( 'slug', siteType, 'siteTitleLabel' ) || '';
		const fieldPlaceholder =
			getSiteTypePropertyValue( 'slug', siteType, 'siteTitlePlaceholder' ) || '';
		return (
			<div className="site-title__wrapper">
				<form>
					<div className="site-title__field-control site-title__title">
						<FormFieldset>
							<FormTextInput
								id="title"
								name="title"
								placeholder={ fieldPlaceholder }
								onChange={ this.handleInputChange }
								value={ siteTitle }
								maxLength={ 100 }
								autoFocus // eslint-disable-line jsx-a11y/no-autofocus
								aria-label={ fieldLabel }
							/>
							<Button primary type="submit" onClick={ this.handleSubmit }>
								{ this.props.translate( 'Continue' ) }
							</Button>{ ' ' }
						</FormFieldset>
					</div>
				</form>
			</div>
		);
	};

	render() {
		const { flowName, positionInFlow, showSiteMockups, siteType, stepName } = this.props;
		const headerText = getSiteTypePropertyValue( 'slug', siteType, 'siteTitleLabel' );
		const subHeaderText = getSiteTypePropertyValue( 'slug', siteType, 'siteTitleSubheader' );

		return (
			<div>
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					headerText={ headerText }
					fallbackHeaderText={ headerText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ subHeaderText }
					stepContent={ this.renderSiteTitleStep() }
					showSiteMockups={ showSiteMockups }
				/>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		siteTitle: getSiteTitle( state ),
		siteType: getSiteType( state ),
	} ),
	{
		recordTracksEvent,
		setSiteTitle,
		saveSignupStep,
		submitSignupStep,
	}
)( localize( SiteTitleStep ) );
