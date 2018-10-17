/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { flow, invoke, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ExampleDomainBrowser from 'components/domains/example-domain-browser';
import ExternalLink from 'components/external-link';
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import FormButton from 'components/forms/form-button';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import ScreenReaderText from 'components/screen-reader-text';
import { infoNotice, removeNotice } from 'state/notices/actions';
import { fetchIsSiteImportable, setNuxUrlInputValue } from 'state/importer-nux/actions';
import {
	getNuxUrlError,
	getNuxUrlInputValue,
	getSiteDetails,
	isUrlInputDisabled,
} from 'state/importer-nux/temp-selectors';
import { validateImportUrl } from 'lib/importers/url-validation';
import { recordTracksEvent } from 'state/analytics/actions';
import {
	SITE_IMPORTER_ERR_BAD_REMOTE,
	SITE_IMPORTER_ERR_INVALID_URL,
} from 'lib/importers/constants';

const CHECKING_SITE_IMPORTABLE_NOTICE = 'checking-site-importable';
const IMPORT_HELP_LINK = 'https://en.support.wordpress.com/import/';
const EXAMPLE_WIX_URL = 'https://username.wixsite.com/my-site';

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
			isLoading,
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
				importSiteDetails: siteDetails,
				importUrl: urlInputValue,
				themeSlugWithRepo: 'pub/radcliffe-2',
			} );

			goToNextStep();
		}

		if ( isLoading !== prevProps.isLoading ) {
			if ( isLoading ) {
				this.props.infoNotice(
					this.props.translate( "Please wait, we're checking to see if we can import this site." ),
					{ id: CHECKING_SITE_IMPORTABLE_NOTICE, icon: 'info', isLoading: true }
				);
			} else {
				this.props.removeNotice( CHECKING_SITE_IMPORTABLE_NOTICE );
			}
		}
	}

	handleInputChange = event => {
		this.props.setNuxUrlInputValue( event.target.value );
	};

	handleInputBlur = event => {
		if ( event.target.value ) {
			this.validateUrl();
		}
	};

	handleInputRef = el => ( this.inputRef = el );

	focusInput = () => invoke( this.inputRef, 'focus' );

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
		}

		if ( this.props.isSiteImportableError ) {
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
			case SITE_IMPORTER_ERR_INVALID_URL:
				return translate( 'This does not appear to be a valid URL or website address.' );
			// @TODO differentiate an unreachable site from one that's not compatible.
			case SITE_IMPORTER_ERR_BAD_REMOTE:
				return translate(
					"We're not able to reach that site at this time, or it's not compatible with our URL importer."
				);
		}

		return translate( 'There was an error with the importer, please try again.' );
	};

	exitFlow = () => {
		const target = '/start';
		this.props.recordTracksEvent( 'calypso_signup_flow_exit', {
			flow: this.props.flowName,
			step: this.props.stepName,
			target,
		} );

		// Exit to main signup flow.
		this.props.goToNextStep( 'main' );
	};

	recordSupportClicked = () => {
		this.props.recordTracksEvent( 'calypso_signup_support_clicked', {
			flow: this.props.flowName,
			step: this.props.stepName,
			support_page: IMPORT_HELP_LINK,
		} );
	};

	renderContent = () => {
		const { isLoading, urlInputValue, translate } = this.props;
		const { showUrlMessage } = this.state;
		const urlMessage = this.getUrlMessage();

		return (
			<Fragment>
				<Card className="import-url__card" tagName="div">
					<form className="import-url__form" onSubmit={ this.handleSubmit }>
						<ScreenReaderText>
							<FormLabel htmlFor="url-input">Site URL</FormLabel>
						</ScreenReaderText>

						<FormTextInput
							id="url-input"
							className="import-url__url-input"
							placeholder={ EXAMPLE_WIX_URL }
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
							{ isLoading
								? translate( 'Checking{{ellipsis/}}', {
										components: { ellipsis: <Fragment>&hellip;</Fragment> },
										comment: 'Indicates user input is being processed.',
								  } )
								: translate( 'Continue' ) }
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
						<li className="import-url__example-url">https://example.com</li>

						<li className="import-url__example-url">{ EXAMPLE_WIX_URL }</li>
					</ul>
					<ExampleDomainBrowser className="import-url__example-browser" />
				</div>

				<div className="import-url__escape">
					{ translate(
						"Don't have a Wix site? We also support importing from {{a}}other sources{{/a}}.",
						{
							components: {
								a: (
									<ExternalLink
										href={ IMPORT_HELP_LINK }
										target="_blank"
										onClick={ this.recordSupportClicked }
									/>
								),
							},
						}
					) }
					&nbsp;
					<Button compact onClick={ this.exitFlow }>
						{ translate( 'Sign up' ) }
					</Button>
				</div>
			</Fragment>
		);
	};

	render() {
		const { flowName, positionInFlow, signupProgress, stepName, translate } = this.props;

		return (
			<StepWrapper
				className="import-url"
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
			isSiteImportableError: getNuxUrlError( state ),
			urlInputValue: getNuxUrlInputValue( state ),
			siteDetails: getSiteDetails( state ),
			isLoading: isUrlInputDisabled( state ),
		} ),
		{
			fetchIsSiteImportable,
			setNuxUrlInputValue,
			recordTracksEvent,
			infoNotice,
			removeNotice,
		}
	),
	localize
)( ImportURLStepComponent );
