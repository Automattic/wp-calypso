/** @format */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import Button from 'components/button';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';
import InfoPopover from 'components/info-popover';
import QueryVerticals from 'components/data/query-verticals';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import { recordTracksEvent } from 'state/analytics/actions';
import { setSiteTitle } from 'state/signup/steps/site-title/actions';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import {
	getSiteVerticalName,
	getSiteVerticalPreview,
} from 'state/signup/steps/site-vertical/selectors';

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
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		translate: PropTypes.func.isRequired,
		siteTitle: PropTypes.string,
		siteVerticalName: PropTypes.string,
		shouldFetchVerticalData: PropTypes.bool,
		siteType: PropTypes.string,
	};

	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	handleInputChange = ( { currentTarget: { value = '' } } ) => this.props.setSiteTitle( value );

	handleSubmit = event => {
		event.preventDefault();

		const { goToNextStep, flowName, siteTitle, stepName } = this.props;

		this.props.setSiteTitle( siteTitle );

		SignupActions.submitSignupStep(
			{
				stepName,
				flowName,
			},
			{ siteTitle }
		);

		this.props.recordTracksEvent( 'calypso_signup_actions_submit_site_title', {
			value: siteTitle,
		} );

		goToNextStep();
	};

	renderSiteTitleStep = () => {
		const {
			shouldFetchVerticalData,
			siteTitle,
			siteType,
			siteVerticalName,
			translate,
		} = this.props;
		const fieldLabel = getSiteTypePropertyValue( 'slug', siteType, 'siteTitleLabel' ) || '';
		const fieldPlaceholder =
			getSiteTypePropertyValue( 'slug', siteType, 'siteTitlePlaceholder' ) || '';
		const fieldDescription = translate(
			"We'll use this as your site title. Don't worry, you can change this later."
		);
		return (
			<div className="site-title__wrapper">
				{ shouldFetchVerticalData && <QueryVerticals searchTerm={ siteVerticalName } /> }
				<form>
					<div className="site-title__field-control site-title__title">
						<FormFieldset>
							<FormLabel htmlFor="title">
								{ fieldLabel }
								<InfoPopover className="site-title__info-popover" position="top">
									{ fieldDescription }
								</InfoPopover>
							</FormLabel>
							<FormTextInput
								id="title"
								name="title"
								placeholder={ fieldPlaceholder }
								onChange={ this.handleInputChange }
								value={ siteTitle }
								maxLength={ 100 }
								autoFocus // eslint-disable-line jsx-a11y/no-autofocus
							/>
							<Button
								title={ this.props.translate( 'Continue' ) }
								aria-label={ this.props.translate( 'Continue' ) }
								primary
								type="submit"
								onClick={ this.handleSubmit }
							>
								<Gridicon icon="arrow-right" />
							</Button>{' '}
						</FormFieldset>
					</div>
				</form>
			</div>
		);
	};

	render() {
		const {
			flowName,
			positionInFlow,
			showSiteMockups,
			signupProgress,
			stepName,
			translate,
		} = this.props;
		const headerText = translate( "Tell us your site's name" );
		const subHeaderText = translate(
			'This will appear at the top of your site and can be changed at anytime.'
		);
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
					signupProgress={ signupProgress }
					stepContent={ this.renderSiteTitleStep() }
					showSiteMockups={ showSiteMockups }
				/>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteType = getSiteType( state );
		const shouldFetchVerticalData =
			ownProps.showSiteMockups && siteType === 'business' && getSiteVerticalPreview( state ) === '';
		return {
			siteTitle: getSiteTitle( state ),
			siteVerticalName: getSiteVerticalName( state ),
			shouldFetchVerticalData,
			siteType,
		};
	},
	{ recordTracksEvent, setSiteTitle }
)( localize( SiteTitleStep ) );
