/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { flow, get, indexOf } from 'lodash';
import debugFactory from 'debug';
import { isWebUri } from 'valid-url';
import { parse as parseURL } from 'url';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import FormTextInput from 'components/forms/form-text-input';
import FormInputValidation from 'components/forms/form-input-validation';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import { setNuxUrlInputValue, setValidationMessage } from 'state/importer-nux/actions';
import {
	getNuxUrlInputValue,
	getSiteDetails,
	getUrlInputValidationMessage,
	isUrlInputDisabled,
} from 'state/importer-nux/temp-selectors';

const debug = debugFactory( 'calypso:signup-step-import-url' );

const normalizeUrlForImportSource = url => {
	// @TODO sanitize? Prepend https:// ..?
	return url;
};

const isValidUrl = ( value = '' ) => {
	const { protocol } = parseURL( value );
	const withProtocol = protocol ? value : 'http://' + value;
	const { hostname } = parseURL( withProtocol );

	return isWebUri( withProtocol ) && indexOf( hostname, '.' ) > 0;
};

class ImportURLStepComponent extends Component {
	componentDidMount() {
		const { queryObject } = this.props;
		const urlFromQueryArg = normalizeUrlForImportSource( get( queryObject, 'url' ) );

		if ( urlFromQueryArg ) {
			this.updateUrlInputValue( urlFromQueryArg );
		}
	}

	state = {
		showError: false,
	};

	handleAction = importUrl => {
		const { urlInputValidationMessage } = this.props;
		debug( { importUrl } );

		if ( urlInputValidationMessage ) {
			this.setState( {
				showError: true,
			} );

			return;
		}

		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {
			importUrl,
			themeSlugWithRepo: 'pub/radcliffe-2',
		} );

		this.props.goToNextStep();
	};

	handleInputChange = event => {
		const value = get( event, 'target.value', '' );

		this.updateUrlInputValue( value );
	};

	hanldeFormSubmission = event => {
		event.preventDefault();

		if ( this.props.urlInputValidationMessage ) {
			this.setState( {
				showError: true,
			} );
		}
	};

	updateUrlInputValue( value ) {
		this.setState( {
			showError: false,
		} );

		this.props.setNuxUrlInputValue( value );
		this.checkValidation( value );
	}

	checkValidation( value ) {
		const message = isValidUrl( value ) ? '' : this.props.translate( 'Please enter a valid URL.' );

		this.props.setValidationMessage( message );
	}

	renderContent = () => {
		const { isInputDisabled, urlInputValidationMessage, urlInputValue, translate } = this.props;
		const { showError } = this.state;
		const shouldShowError = urlInputValidationMessage && showError;

		return (
			<form className="import-url__wrapper" onSubmit={ this.hanldeFormSubmission }>
				<FormTextInput
					placeholder="Enter the URL of your existing site"
					action="Continue"
					label={ translate( 'URL' ) }
					onChange={ this.handleInputChange }
					onBlur={ this.handleInputBlur }
					disabled={ isInputDisabled }
					value={ urlInputValue }
					isError={ !! shouldShowError }
				/>
				{ shouldShowError ? (
					<FormInputValidation
						text={ urlInputValidationMessage }
						isError={ !! shouldShowError }
						isWarning={ ! shouldShowError }
					/>
				) : (
					<FormSettingExplanation>
						{ translate( 'Please enter a valid URL.' ) }
					</FormSettingExplanation>
				) }
				<ButtonGroup>
					<Button primary>{ translate( 'Continue' ) }</Button>
					<Button>Skip</Button>
				</ButtonGroup>
			</form>
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
					"Enter your site's URL, sometimes called a domain name or site address."
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
			isInputDisabled: isUrlInputDisabled( state ),
			urlInputValidationMessage: getUrlInputValidationMessage( state ),
		} ),
		{
			setNuxUrlInputValue,
			setValidationMessage,
		}
	),
	localize
)( ImportURLStepComponent );
