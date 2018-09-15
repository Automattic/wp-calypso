/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { flow, get, indexOf, inRange } from 'lodash';
import { isWebUri } from 'valid-url';
import { parse as parseURL } from 'url';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import FormTextInputWithAction from 'components/forms/form-text-input-with-action';
import {
	fetchIsSiteImportable,
	setNuxUrlInputValue,
	setValidationMessage,
} from 'state/importer-nux/actions';
import FormInputValidation from 'components/forms/form-input-validation';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import {
	getNuxUrlInputValue,
	getSiteDetails,
	getUrlInputValidationMessage,
	isUrlInputDisabled,
} from 'state/importer-nux/temp-selectors';

const normalizeUrlForImportSource = url => {
	// @TODO sanitize? Prepend https:// ..?
	return url;
};

const isValidUrl = ( value = '' ) => {
	const { protocol } = parseURL( value );
	const withProtocol = protocol ? value : 'http://' + value;
	const { hostname } = parseURL( withProtocol );
	const hasDot = inRange( indexOf( hostname, '.' ), 1, hostname.length - 2 );

	return isWebUri( withProtocol ) && hasDot;
};

class ImportURLStepComponent extends Component {
	componentDidMount() {
		const { queryObject } = this.props;
		const urlFromQueryArg = normalizeUrlForImportSource( get( queryObject, 'url' ) );

		if ( urlFromQueryArg ) {
			this.handleInputChange( urlFromQueryArg );
		}
	}

	state = {
		showValidation: false,
	};

	handleAction = () => {
		event.preventDefault();

		if ( this.props.urlInputValidationMessage ) {
			return this.setState( {
				showValidation: true,
			} );
		}

		this.goToNextStep( {} );
	};

	goToNextStep = () => {
		const { urlInputValue } = this.props;
		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {
			importUrl: urlInputValue,
			themeSlugWithRepo: 'pub/radcliffe-2',
		} );

		this.props.goToNextStep();
	};

	handleInputChange = value => {
		const validationMessage = isValidUrl( value )
			? ''
			: this.props.translate( 'Please enter a valid URL.' );

		this.setState( {
			showValidation: false,
		} );

		this.props.setNuxUrlInputValue( value );
		this.props.setValidationMessage( validationMessage );
	};

	handleInputBlur = () => {
		this.setState( {
			showValidation: true,
		} );
	};

	checkValidation( value ) {
		const message = isValidUrl( value ) ? '' : this.props.translate( 'Please enter a valid URL.' );

		this.props.setValidationMessage( message );
	}

	fetchIsSiteImportable = () => {
		const normalizedUrl = normalizeUrlForImportSource( this.props.urlInputValue );
		this.props.fetchIsSiteImportable( normalizedUrl );
	};

	renderContent = () => {
		const { isInputDisabled, urlInputValidationMessage, urlInputValue, translate } = this.props;
		const { showValidation } = this.state;

		return (
			<div className="import-url__wrapper">
				<FormTextInputWithAction
					placeholder={ translate( 'Enter the URL of your existing site' ) }
					action="Continue"
					onAction={ this.handleAction }
					label={ translate( 'URL' ) }
					onChange={ this.handleInputChange }
					defaultValue={ urlInputValue }
					disabled={ isInputDisabled }
					onBlur={ this.handleInputBlur }
				/>
				{ showValidation ? (
					<FormInputValidation
						text={ urlInputValidationMessage || translate( 'This URL is valid (copy)' ) }
						isError={ !! urlInputValidationMessage }
					/>
				) : (
					<FormSettingExplanation>
						{ translate( 'Please enter a valid URL.' ) }
					</FormSettingExplanation>
				) }
			</div>
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
			fetchIsSiteImportable,
			setNuxUrlInputValue,
			setValidationMessage,
		}
	),
	localize
)( ImportURLStepComponent );
