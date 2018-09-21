/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize, translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { flow, get, indexOf, inRange, trim, isString } from 'lodash';
import { isWebUri } from 'valid-url';
import { parse as parseURL } from 'url';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import FormTextInputWithAction from 'components/forms/form-text-input-with-action';
import { setNuxUrlInputValue, setValidationMessage } from 'state/importer-nux/actions';
import FormInputValidation from 'components/forms/form-input-validation';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import {
	getNuxUrlInputValue,
	getSiteDetails,
	getUrlInputValidationMessage,
	isUrlInputDisabled,
} from 'state/importer-nux/temp-selectors';

const normalizeUrlForImportSource = ( url = '' ) => {
	url = trim( url );
	const { protocol } = parseURL( url );
	return protocol ? url : 'http://' + url;
};

const getValidationMessageForUrl = ( value = '' ) => {
	const url = normalizeUrlForImportSource( value );
	const { hostname, pathname } = parseURL( url );
	const hasDot = isString( hostname ) && inRange( indexOf( hostname, '.' ), 1, hostname.length - 2 );

	if ( ! isWebUri( url ) || ! hasDot ) {
		return translate( 'Please enter a full URL.' );
	} else if ( hostname === 'editor.wix.com' || hostname === 'www.wix.com' ) {
		return translate(
			"You've entered the URL for the Wix editor, which only you can access. Please enter your site's public URL. It should look like one of the examples below."
		);
	} else if ( hostname.indexOf( '.wixsite.com' ) > -1 && pathname === '/' ) {
		return translate(
			"You haven't entered the full URL. Please include the part of the URL that comes after wixsite.com. See below for an example."
		);
	} else if ( hostname.indexOf( 'wordpress.com' ) > -1 ) {
		return translate(
			"You have entered a URL of WordPress.com site. Please enter a URL of a Wix site to start the import."
		);
	}

	return null;
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
		const validationMessage = getValidationMessageForUrl( value );

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

	renderContent = () => {
		const { isInputDisabled, urlInputValidationMessage, urlInputValue, translate } = this.props;
		const { showValidation } = this.state;

		return (
			<div className="import-url__wrapper">
				<FormTextInputWithAction
					placeholder={ translate( 'Please enter the full URL of your site.' ) }
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
						text={ urlInputValidationMessage || translate( 'This URL is valid.' ) }
						isError={ !! urlInputValidationMessage }
					/>
				) : (
					<FormSettingExplanation>
						{ translate( 'Please enter the full URL of your site.' ) }
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
			setNuxUrlInputValue,
			setValidationMessage,
		}
	),
	localize
)( ImportURLStepComponent );
