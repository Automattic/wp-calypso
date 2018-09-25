/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { flow, indexOf, inRange } from 'lodash';
import { isWebUri } from 'valid-url';
import { parse as parseURL } from 'url';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import StepWrapper from 'signup/step-wrapper';
// import SignupActions from 'lib/signup/actions';
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';
import { fetchIsSiteImportable, setNuxUrlInputValue } from 'state/importer-nux/actions';
import FormInputValidation from 'components/forms/form-input-validation';
import {
	getNuxUrlInputValue,
	getSiteDetails,
	isUrlInputDisabled,
} from 'state/importer-nux/temp-selectors';

// const normalizeUrlForImportSource = url => {
// 	// @TODO sanitize? Prepend https:// ..?
// 	return url;
// };

const isValidUrl = ( value = '' ) => {
	const { protocol } = parseURL( value );
	const withProtocol = protocol ? value : 'http://' + value;
	const { hostname } = parseURL( withProtocol );
	const hasDot = inRange( indexOf( hostname, '.' ), 1, hostname.length - 2 );

	return isWebUri( withProtocol ) && hasDot;
};

const getUrlValidationMessage = function( url ) {
	return isValidUrl( url ) ? null : 'Please enter a valid URL';
};

class ImportURLStepComponent extends Component {
	state = {
		// Url message could be client-side validation or server-side error.
		showUrlMessage: false,
		urlValidationMessage: '',
		isSiteImportableError: '',
	};

	// componentDidUpdate() {
	// 	if ( this.props.siteDetails.siteUrl ) {
	// 		// this.goToNextStep();
	// 	}
	// }

<<<<<<< HEAD
	goToNextStep = () => {
		const { siteDetails, urlInputValue } = this.props;
		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {
			importUrl: urlInputValue,
			importSiteDetails: siteDetails,
			themeSlugWithRepo: 'pub/radcliffe-2',
		} );
=======
	// goToNextStep = () => {
	// 	const { urlInputValue } = this.props;
	// 	SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {
	// 		importUrl: urlInputValue,
	// 		themeSlugWithRepo: 'pub/radcliffe-2',
	// 	} );
>>>>>>> Updates site validation UI and check if a valid url is importable

	// 	// this.props.goToNextStep();
	// };

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

	handleSubmit = event => {
		event.preventDefault();

		const isValid = this.validateUrl();

		if ( ! isValid ) {
			return;
		}

		this.props.fetchIsSiteImportable( this.props.urlInputValue );
	};

	validateUrl = () => {
		const validationMessage = getUrlValidationMessage( this.props.urlInputValue );
		const isValid = ! validationMessage;

		this.setState( {
			urlValidationMessage: isValid ? '' : validationMessage,
			showUrlMessage: true,
		} );

		return isValid;
	};

	isUrlValid = () => ! this.state.urlValidationMessage;

	renderContent = () => {
		// const { isLoading, urlInputValidationMessage, urlInputValue, translate } = this.props;
		const { isLoading, urlInputValue, translate } = this.props;
		const { showUrlMessage, urlValidationMessage } = this.state;
		const isUrlInvalid = ! this.isUrlValid();

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
					/>
					<FormButton disabled={ isLoading } busy={ isLoading } type="submit">
						{ translate( 'Continue' ) }
					</FormButton>
				</form>
				{ showUrlMessage &&
					isUrlInvalid && (
						<FormInputValidation text={ urlValidationMessage } isError={ isUrlInvalid } />
					) }
			</Card>
		);
	};

	render() {
		const { flowName, positionInFlow, signupProgress, stepName, translate } = this.props;

		return (
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
		);
	}
}

export default flow(
	connect(
		state => ( {
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
