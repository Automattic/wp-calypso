/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { flow, get, includes, invoke } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, ScreenReaderText } from '@automattic/components';
import ExampleDomainBrowser from 'components/domains/example-domain-browser';
import ExternalLink from 'components/external-link';
import StepWrapper from 'signup/step-wrapper';
import FormButton from 'components/forms/form-button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import { setImportOriginSiteDetails, setNuxUrlInputValue } from 'state/importer-nux/actions';
import { getNuxUrlInputValue } from 'state/importer-nux/temp-selectors';
import { validateImportUrl } from 'lib/importer/url-validation';
import { recordTracksEvent } from 'state/analytics/actions';
import Notice from 'components/notice';
import wpcom from 'lib/wp';
import { saveSignupStep } from 'state/signup/progress/actions';
import { suggestDomainFromImportUrl } from 'lib/importer/utils';

/**
 * Style dependencies
 */
import './style.scss';

const IMPORT_HELP_LINK = 'https://wordpress.com/support/import/';
const EXAMPLE_CUSTOM_DOMAIN_URL = 'https://example.com';
const EXAMPLE_WIX_URL = 'https://username.wixsite.com/my-site';
const EXAMPLE_GOCENTRAL_URL = 'https://example.godaddysites.com';

class ImportURLStepComponent extends Component {
	state = {
		isLoading: false,
		// Url message could be client-side validation or server-side error.
		urlValidationMessage: '',
	};

	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
		this.setInputValueFromProps();
		this.focusInput();
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

	setUrlError = urlValidationMessage => this.setState( { urlValidationMessage }, this.focusInput );

	handleSubmit = event => {
		event.preventDefault();
		const isValid = this.validateUrl();

		if ( ! isValid ) {
			return;
		}

		const { stepName, translate, urlInputValue } = this.props;

		this.setState( {
			isLoading: true,
			urlValidationMessage: '',
		} );

		wpcom
			.undocumented()
			.isSiteImportable( urlInputValue )
			.then(
				( {
					site_engine: siteEngine,
					site_favicon: siteFavicon,
					site_status: siteStatus,
					site_title: siteTitle,
					site_url: siteUrl,
					importer_types: importerTypes,
				} ) => {
					if ( ! includes( importerTypes, 'url' ) ) {
						return this.setUrlError(
							translate(
								"That doesn't seem to be a Wix or GoDaddy site. Please check the URL and try again."
							)
						);
					}

					if ( 404 === siteStatus ) {
						return this.setUrlError(
							translate( 'That site was not found. Please check the URL and try again.' )
						);
					}

					// We need a successful response for url importers to work.
					if ( includes( importerTypes, 'url' ) && 200 !== siteStatus ) {
						return this.setUrlError(
							translate( 'That site responded with an error. Please check the URL and try again.' )
						);
					}

					this.props.setImportOriginSiteDetails( {
						importerTypes,
						siteUrl,
						siteEngine,
						siteFavicon,
						siteTitle,
					} );

					this.props.submitSignupStep(
						{ stepName },
						{
							importSiteEngine: siteEngine,
							importSiteFavicon: siteFavicon,
							importSiteUrl: siteUrl,
							siteTitle,
							suggestedDomain: suggestDomainFromImportUrl( siteUrl ),
							themeSlugWithRepo: 'pub/modern-business',
						}
					);
					this.props.goToNextStep();
				},
				error => {
					switch ( error.code ) {
						case 'rest_invalid_param':
							return this.setUrlError(
								translate( "We couldn't reach that site. Please check the URL and try again." )
							);
					}
					return this.setUrlError(
						translate( 'Something went wrong. Please check the URL and try again.' )
					);
				}
			)
			.finally( () =>
				this.setState( {
					isLoading: false,
				} )
			);
	};

	setInputValueFromProps = () => {
		const { queryObject, urlInputValue } = this.props;
		const inputValue = urlInputValue || get( queryObject, 'url', '' );
		this.props.setNuxUrlInputValue( inputValue );
	};

	validateUrl = () => {
		const validationMessage = validateImportUrl( this.props.urlInputValue );
		const isValid = ! validationMessage;

		if ( ! isValid ) {
			this.setUrlError( validationMessage );
		}

		return isValid;
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

	renderNotice = () => {
		const { urlValidationMessage } = this.state;

		if ( urlValidationMessage ) {
			return (
				<Notice className="import-url__url-input-message" status="is-error" showDismiss={ false }>
					{ urlValidationMessage }
				</Notice>
			);
		}

		return <div className="import-url__notice-placeholder" />;
	};

	renderContent = () => {
		const { urlInputValue, translate } = this.props;
		const { isLoading, urlValidationMessage } = this.state;

		return (
			<Fragment>
				<div className="import-url__wrapper">
					<form className="import-url__form" onSubmit={ this.handleSubmit }>
						<ScreenReaderText>
							<FormLabel htmlFor="url-input">Site URL</FormLabel>
						</ScreenReaderText>

						<FormTextInput
							id="url-input"
							className="import-url__url-input"
							placeholder={ EXAMPLE_CUSTOM_DOMAIN_URL }
							disabled={ isLoading }
							defaultValue={ urlInputValue }
							onChange={ this.handleInputChange }
							onBlur={ this.handleInputBlur }
							inputRef={ this.handleInputRef }
							isError={ !! urlValidationMessage }
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
					{ this.renderNotice() }
				</div>

				<div className="import-url__example">
					<ul className="import-url__example-urls">
						{ translate( 'Example URLs', {
							comment: 'Title for list of example urls, such as "example.com"',
						} ) }
						<li className="import-url__example-url">{ EXAMPLE_CUSTOM_DOMAIN_URL }</li>
						<li className="import-url__example-url">{ EXAMPLE_WIX_URL }</li>
						<li className="import-url__example-url">{ EXAMPLE_GOCENTRAL_URL }</li>
					</ul>
					<ExampleDomainBrowser className="import-url__example-browser" />
				</div>

				<div className="import-url__escape">
					{ translate(
						"Don't have a Wix or GoDaddy GoCentral site? We also support importing from {{a}}other sources{{/a}}.",
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
		const { flowName, positionInFlow, stepName, translate } = this.props;

		const headerText = translate( 'Where can we find your old site?' );
		const subHeaderText = translate(
			'Enter your Wix or GoDaddy GoCentral site URL, sometimes called a domain name or site address.'
		);

		return (
			<StepWrapper
				className="import-url"
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ subHeaderText }
				fallbackSubHeaderText={ subHeaderText }
				stepContent={ this.renderContent() }
			/>
		);
	}
}

export default flow(
	connect(
		state => ( {
			urlInputValue: getNuxUrlInputValue( state ),
		} ),
		{
			recordTracksEvent,
			saveSignupStep,
			setImportOriginSiteDetails,
			setNuxUrlInputValue,
		}
	),
	localize
)( ImportURLStepComponent );
