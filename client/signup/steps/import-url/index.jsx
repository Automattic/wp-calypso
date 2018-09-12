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
import { setNuxUrlInputValue, setValidationMessage } from 'state/importer-nux/actions';
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

	handleAction = importUrl => {
		if ( this.props.urlInputValidationMessage ) {
			return this.setState( {
				showValidation: true,
			} );
		}
		const { siteDetails } = this.props;

		event.preventDefault();
		debug( { importUrl, siteDetails } );

		this.goToNextStep( {} );
	};

	goToNextStep = () => {
		const { siteDetails, urlInputValue } = this.props;
		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {
			importUrl: urlInputValue,
			importFromService: 'wix', // @TODO pull this out of the siteDetails
			importSiteDetails: siteDetails,
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
		const { translate } = this.props;
		const message = isValidUrl( value )
			? ''
			: translate( 'Please enter the full URL of your site.' );

		this.props.setValidationMessage( message );
	}

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
