/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { flow, get, includes, invoke, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import StepWrapper from 'signup/step-wrapper';
import FormButton from 'components/forms/form-button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import ScreenReaderText from 'components/screen-reader-text';
import { setImportOriginSiteDetails, setNuxUrlInputValue } from 'state/importer-nux/actions';
import { getNuxUrlInputValue } from 'state/importer-nux/temp-selectors';
import { validateImportUrl } from 'lib/importer/url-validation';
import { recordTracksEvent } from 'state/analytics/actions';
import Notice from 'components/notice';
import wpcom from 'lib/wp';
import { saveSignupStep } from 'state/signup/progress/actions';
import { suggestDomainFromImportUrl } from 'lib/importer/utils';
import { getFileImporters } from 'lib/importer/importer-config';
import ImporterLogo from 'my-sites/importer/importer-logo';

/**
 * Style dependencies
 */
import './style.scss';

class ImportURLOnboardingStepComponent extends Component {
	state = {
		displayFallbackEngines: false,
		fallbackSiteDetails: {
			siteFavion: '',
			siteTitle: '',
			siteUrl: '',
		},
		isLoading: false,
		// Url message could be client-side validation or server-side error.
		urlValidationMessage: '',
	};

	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
		this.setInputValueFromProps();
		this.focusInput();
	}

	handleEngineSelect = siteEngine => event => {
		event.preventDefault();

		const { stepName } = this.props;
		const { siteFavicon, siteTitle, siteUrl } = this.state.fallbackSiteDetails;

		this.props.setImportOriginSiteDetails( {
			importerTypes: [ 'file' ],
			importSiteUrl: siteUrl,
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
				themeSlugWithRepo: 'pub/modern-business',
			}
		);

		this.props.goToNextStep();
	};

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

					if ( 'unknown' === siteEngine || isEmpty( importerTypes ) ) {
						return this.setState( {
							displayFallbackEngines: true,
							fallbackSiteDetails: {
								siteFavicon,
								siteTitle,
								siteUrl,
							},
						} );
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

	renderNotice = () => {
		const { urlValidationMessage } = this.state;

		if ( urlValidationMessage ) {
			return (
				<Notice
					className="import-url-onboarding__url-input-message"
					status="is-error"
					showDismiss={ false }
				>
					{ urlValidationMessage }
				</Notice>
			);
		}

		return <div className="import-url-onboarding__notice-placeholder" />;
	};

	renderFallbackEngines = () => {
		const fallbackEngines = getFileImporters();

		return (
			<div className="import-url-onboarding__fallback">
				{ fallbackEngines.map( ( { engine, icon, title } ) => (
					<Card key={ engine } displayAsLink onClick={ this.handleEngineSelect( engine ) }>
						<ImporterLogo icon={ icon } />
						<div className="import-url-onboarding__service-info">
							<h1 className="import-url-onboarding__service-title">{ title }</h1>
						</div>
					</Card>
				) ) }
			</div>
		);
	};

	renderUrlForm = () => {
		const { urlInputValue, translate } = this.props;
		const { isLoading, urlValidationMessage } = this.state;

		return (
			<Fragment>
				<div className="import-url-onboarding__wrapper">
					<form className="import-url-onboarding__form" onSubmit={ this.handleSubmit }>
						<ScreenReaderText>
							<FormLabel htmlFor="url-input">Site URL</FormLabel>
						</ScreenReaderText>

						<FormTextInput
							id="url-input"
							className="import-url-onboarding__url-input"
							placeholder={ translate( 'Website URL' ) }
							disabled={ isLoading }
							defaultValue={ urlInputValue }
							onChange={ this.handleInputChange }
							onBlur={ this.handleInputBlur }
							inputRef={ this.handleInputRef }
							isError={ !! urlValidationMessage }
						/>

						<FormButton
							className="import-url-onboarding__submit-button"
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
			</Fragment>
		);
	};

	render() {
		const { flowName, positionInFlow, stepName, translate } = this.props;
		const { displayFallbackEngines } = this.state;

		const headerText = displayFallbackEngines
			? translate( 'Where did you get your import file?' )
			: translate( 'Where can we find your old site?' );
		const subHeaderText =
			! displayFallbackEngines &&
			translate(
				"We'll check your website to see what content we can bring to your new WordPress site."
			);
		const content = displayFallbackEngines ? this.renderFallbackEngines() : this.renderUrlForm();

		return (
			<StepWrapper
				className="import-url-onboarding"
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ subHeaderText }
				fallbackSubHeaderText={ subHeaderText }
				stepContent={ content }
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
)( ImportURLOnboardingStepComponent );
