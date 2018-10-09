/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { flow, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Notice from 'components/notice';
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';
import { fetchIsSiteImportable, setNuxUrlInputValue } from 'state/importer-nux/actions';
import FormInputValidation from 'components/forms/form-input-validation';
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
		// Hide validation if user is updating input.
		this.setState( {
			showUrlMessage: false,
		} );

		this.props.setNuxUrlInputValue( event.target.value );
	};

	handleInputBlur = () => {
		this.validateUrl();
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
			<Card className="import-url__wrapper site-importer__site-importer-pane" tagName="div">
				<form
					className="import-url__form site-importer__site-importer-url-input"
					onSubmit={ this.handleSubmit }
				>
					<FormTextInput
						placeholder="https://example.wixsite.com/mysite"
						disabled={ isLoading }
						defaultValue={ urlInputValue }
						onChange={ this.handleInputChange }
						onBlur={ this.handleInputBlur }
						inputRef={ this.handleInputRef }
					/>
					<FormButton disabled={ isLoading } busy={ isLoading } type="submit">
						{ translate( 'Continue' ) }
					</FormButton>
				</form>
				{ showUrlMessage &&
					urlMessage && <FormInputValidation text={ urlMessage } isError={ !! urlMessage } /> }
			</Card>
		);
	};

	render() {
		const { flowName, isLoading, positionInFlow, signupProgress, stepName, translate } = this.props;
		const noticeText = translate(
			"Please wait, we're checking to see if we can import this site."
		);

		return (
			<div>
				{ isLoading && (
					<Notice
						status="is-info"
						icon="info"
						isLoading={ true }
						text={ noticeText }
						showDismiss={ false }
						isCompact={ true }
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
