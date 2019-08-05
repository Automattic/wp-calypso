/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { flow, get, includes, invoke, isEmpty, pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ExampleDomainBrowser from 'components/domains/example-domain-browser';
import ExternalLink from 'components/external-link';
import StepWrapper from 'signup/step-wrapper';
import FormButton from 'components/forms/form-button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import ScreenReaderText from 'components/screen-reader-text';
import { setImportOriginSiteDetails, setNuxUrlInputValue } from 'state/importer-nux/actions';
import { getNuxUrlInputValue } from 'state/importer-nux/temp-selectors';
import { validateImportUrl } from 'lib/importers/url-validation';
import { recordTracksEvent } from 'state/analytics/actions';
import Notice from 'components/notice';
import wpcom from 'lib/wp';
import ImporterLogo from 'my-sites/importer/importer-logo';

/**
 * Style dependencies
 */
import './style.scss';

const IMPORT_HELP_LINK = 'https://en.support.wordpress.com/import/';
const EXAMPLE_CUSTOM_DOMAIN_URL = 'https://example.com';
const EXAMPLE_WIX_URL = 'https://username.wixsite.com/my-site';
const EXAMPLE_GOCENTRAL_URL = 'https://example.godaddysites.com';

// @TODO: put this all in one shared place for `my-sites/importer` and signup
const FALLBACK_ENGINES = [
	{
		title: 'WordPress',
		description: 'Import posts, pages, and media ' + 'from a WordPress export\u00A0file.',
		engine: 'wordpress',
		icon: 'wordpress',
	},
	{
		title: 'Blogger',
		description: 'blogger',
		engine: 'blogger',
		icon: 'blogger-alt',
	},
	{
		title: 'Medium',
		description: 'medium',
		engine: 'medium',
		icon: 'medium',
	},
	{
		title: 'Squarespace',
		description: 'squarespace',
		engine: 'squarespace',
		icon: 'squarespace',
	},
];

class ImportURLStepComponent extends Component {
	state = {
		displayFallbackEngines: false,
		isLoading: false,
		// Url message could be client-side validation or server-side error.
		urlValidationMessage: '',
	};

	componentDidMount() {
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

	setUrlError = urlValidationMessage =>
		this.setState(
			{
				urlValidationMessage,
			},
			this.focusInput
		);

	handleEngineSelect = engine => event => {
		event.preventDefault();
	};

	handleSubmit = event => {
		event.preventDefault();
		const isValid = this.validateUrl();

		if ( ! isValid ) {
			return;
		}

		const { stepName, translate, urlInputValue } = this.props;

		this.setState( {
			displayFallbackEngines: false,
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
					if ( 404 === siteStatus ) {
						return this.setUrlError(
							translate( 'The URL entered was not found. Double-check the URL and try again.' )
						);
					}

					if ( includes( importerTypes, 'url' ) && 200 !== siteStatus ) {
						return this.setUrlError(
							translate( "We're not able to reach that URL. Double-check the URL and try again." )
						);
					}

					if ( 'unknown' !== siteEngine && isEmpty( importerTypes ) ) {
						// @todo: Do we actually want an error here? Shouldn't this lead to the fallback step?
						// return this.setUrlError( '...' );
					}

					if ( 'unknown' === siteEngine || isEmpty( importerTypes ) ) {
						return this.setState( {
							displayFallbackEngines: true,
						} );
					}

					this.props.setImportOriginSiteDetails( {
						importerTypes,
						importSiteUrl: siteUrl,
						siteEngine,
						siteFavicon,
						siteTitle,
					} );

					this.props.submitSignupStep(
						{ stepName },
						pickBy( {
							importSiteEngine: siteEngine,
							importSiteFavicon: siteFavicon,
							importSiteUrl: siteUrl,
							siteTitle,
							themeSlugWithRepo: 'pub/modern-business',
						} )
					);
					this.props.goToNextStep();
				},
				error => {
					switch ( error.code ) {
						case 'rest_invalid_param':
							return this.setUrlError(
								translate( "We're not able to parse that URL. Double-check the URL and try again." )
							);
					}
					return this.setUrlError(
						translate( 'Something went wrong. Double-check the URL and try again later.' )
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

		this.setUrlError( isValid ? '' : validationMessage );

		return isValid;
	};

	getIsSiteImportableError = () => {
		if ( ! this.props.isSiteImportableError ) {
			return null;
		}
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

	renderFallbackEngines = () => {
		return (
			<div className="import-url__fallback">
				{ FALLBACK_ENGINES.map( ( { description, engine, icon, title } ) => {
					return (
						<Card displayAsLink onClick={ this.handleEngineSelect( engine ) }>
							<ImporterLogo icon={ icon } />
							<div className="importer-header__service-info">
								<h1 className="importer-header__service-title">{ title }</h1>
								<p>{ description }</p>
							</div>
						</Card>
					);
				} ) }
			</div>
		);
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
		const { displayFallbackEngines, isLoading, urlValidationMessage } = this.state;

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

				{ displayFallbackEngines && this.renderFallbackEngines() }

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
		const { flowName, positionInFlow, signupProgress, stepName, translate } = this.props;

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
		} ),
		{
			recordTracksEvent,
			setImportOriginSiteDetails,
			setNuxUrlInputValue,
		}
	),
	localize
)( ImportURLStepComponent );
