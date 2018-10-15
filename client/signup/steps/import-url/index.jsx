/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { flow, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ExampleDomainBrowser from 'components/domains/example-domain-browser';
import Notice from 'components/notice';
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';
import FormInputValidation from 'components/forms/form-input-validation';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import { fetchIsSiteImportable, setNuxUrlInputValue } from 'state/importer-nux/actions';
import {
	getNuxUrlError,
	getNuxUrlInputValue,
	getSiteDetails,
	isUrlInputDisabled,
} from 'state/importer-nux/temp-selectors';
import { validateImportUrl } from '../../../my-sites/importer/site-importer/url-validation';

class ImportURLStepComponent extends Component {
	state = {
		// Url message could be client-side validation or server-side error.
		showUrlMessage: false,
		urlValidationMessage: '',
	};

	componentDidUpdate( prevProps ) {
		const {
			isSiteImportableError,
			goToNextStep,
			urlInputValue,
			stepName,
			siteDetails,
		} = this.props;

		// isSiteImportable error, focus input to revise url.
		if (
			! isEqual( prevProps.isSiteImportableError, isSiteImportableError ) &&
			isSiteImportableError
		) {
			this.focusInput();
		}

		// We have a verified, importable site url.
		if ( ! isEqual( prevProps.siteDetails, siteDetails ) && siteDetails ) {
			SignupActions.submitSignupStep( { stepName }, [], {
				importUrl: urlInputValue,
				themeSlugWithRepo: 'pub/radcliffe-2',
			} );

			goToNextStep();
		}
	}

	handleInputChange = event => {
		this.props.setNuxUrlInputValue( event.target.value );
	};

	handleInputBlur = event => {
		if ( event.target.value ) this.validateUrl();
	};

	handleInputRef = el => ( this.inputRef = el );

	focusInput = () => this.inputRef && this.inputRef.focus();

	handleSubmit = event => {
		event.preventDefault();

		const isValid = this.validateUrl();

		if ( ! isValid ) {
			this.focusInput();
			return;
		}

		this.props.fetchIsSiteImportable( this.props.urlInputValue );
	};

	validateUrl = () => {
		const validationMessage = validateImportUrl( this.props.urlInputValue );
		const isValid = ! validationMessage;

		this.setState( {
			urlValidationMessage: isValid ? '' : validationMessage,
			showUrlMessage: true,
		} );

		return isValid;
	};

	getUrlMessage = () => {
		if ( this.state.urlValidationMessage ) {
			return this.state.urlValidationMessage;
		} else if ( this.props.isSiteImportableError ) {
			return this.getIsSiteImportableError();
		}

		return '';
	};

	getIsSiteImportableError = () => {
		if ( ! this.props.isSiteImportableError ) {
			return null;
		}

		const { isSiteImportableError, translate } = this.props;

		switch ( isSiteImportableError.code ) {
			case 1000001:
				return translate( 'This does not appear to be a valid URL or website address.' );
			// @TODO differentiate an unreachable site from one that's not compatible.
			case 1000002:
				return translate(
					"We're not able to reach that site at this time, or it's not compatible with our URL importer."
				);
		}

		return translate( 'There was an error with the importer, please try again.' );
	};

	renderContent = () => {
		const { isLoading, urlInputValue, translate } = this.props;
		const { showUrlMessage } = this.state;
		const urlMessage = this.getUrlMessage();

		return (
			<Fragment>
				<Card className="import-url__card" tagName="div">
					<form className="import-url__form" onSubmit={ this.handleSubmit }>
						<FormTextInput
							className="import-url__url-input"
							placeholder="https://example.wixsite.com/mysite"
							disabled={ isLoading }
							defaultValue={ urlInputValue }
							onChange={ this.handleInputChange }
							onBlur={ this.handleInputBlur }
							inputRef={ this.handleInputRef }
							isError={ !! urlMessage }
						/>
						<FormButton
							className="import-url__submit-button"
							disabled={ isLoading }
							busy={ isLoading }
							type="submit"
						>
							{ isLoading ? translate( 'Checking&hellip;' ) : translate( 'Continue' ) }
						</FormButton>
					</form>
					{ showUrlMessage && urlMessage ? (
						<FormInputValidation
							className="import-url__url-input-message"
							text={ urlMessage }
							isError={ !! urlMessage }
						/>
					) : (
						<FormSettingExplanation className="import-url__url-input-message">
							{ translate( 'Please enter the full URL of your site.' ) }
						</FormSettingExplanation>
					) }
				</Card>

				<div className="import-url__example">
					<ul className="import-url__example-urls">
						{ translate( 'Example URLs', {
							comment: 'Title for list of example urls, such as "example.com"',
						} ) }
						<li className="import-url__example-url">example.com</li>

						<li className="import-url__example-url">account.wixsite.com/my-site</li>
					</ul>
					<ExampleDomainBrowser className="import-url__example-browser" />
				</div>
			</Fragment>
		);
	};

	render() {
		const { flowName, isLoading, positionInFlow, signupProgress, stepName, translate } = this.props;
		const noticeText = translate(
			"Please wait, we're checking to see if we can import this site."
		);

		return (
			<div className="import-url">
				{ isLoading && (
					<Notice
						className="import-url__notice"
						status="is-info"
						icon="info"
						isLoading={ true }
						text={ noticeText }
						showDismiss={ false }
					/>
				) }
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					headerText={ translate( 'Where can we find your old site?' ) }
					subHeaderText={ translate(
						"Enter your Wix site's URL, sometimes called a domain name or site address."
					) }
					signupProgress={ signupProgress }
					stepContent={ this.renderContent() }
				/>
			</div>
		);
	}
}

export default flow(
	connect(
		state => ( {
			isSiteImportableError: getNuxUrlError( state ),
			urlInputValue: getNuxUrlInputValue( state ),
			siteDetails: getSiteDetails( state ),
			isLoading: isUrlInputDisabled( state ),
		} ),
		{
			fetchIsSiteImportable,
			setNuxUrlInputValue,
		}
	),
	localize
)( ImportURLStepComponent );
