import { Card, Button, FormLabel, FormInputValidation, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';
import SuggestionSearch from 'calypso/components/suggestion-search';
import { isValidUrl } from 'calypso/lib/importer/url-validation';
import { NOT_EXISTS } from './connection-notice-types';

const noop = () => {};

class JetpackConnectSiteUrlInput extends Component {
	static propTypes = {
		handleOnClickTos: PropTypes.func,
		isError: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		isFetching: PropTypes.bool,
		isInstall: PropTypes.bool,
		onChange: PropTypes.func,
		onSubmit: PropTypes.func,
		translate: PropTypes.func.isRequired,
		url: PropTypes.string,
		autoFocus: PropTypes.bool,
		isSearch: PropTypes.bool,
	};

	static defaultProps = {
		candidateSites: [],
		onChange: noop,
		url: '',
		autoFocus: true,
	};

	state = {
		errorMessage: null,
	};

	focusInput = noop;

	refInput = ( formInputComponent ) => {
		this.focusInput = () => formInputComponent.focus();
	};

	beforeUnloadHandler = () => {
		this.setState( {
			isUnloading: true,
		} );
	};

	componentDidUpdate() {
		if ( ! this.props.isError ) {
			return;
		}

		this.focusInput();
	}

	componentDidMount() {
		window.addEventListener( 'beforeunload', this.beforeUnloadHandler );
	}

	componentWillUnmount() {
		window.removeEventListener( 'beforeunload', this.beforeUnloadHandler );
	}

	handleKeyPress = ( event ) => {
		if ( 13 === event.keyCode && ! this.isFormSubmitDisabled() && ! this.isFormSubmitBusy() ) {
			this.handleFormSubmit();
		}
	};

	renderButtonLabel() {
		const { isSearch, translate } = this.props;

		if ( ! this.props.isFetching && ! this.state.isUnloading ) {
			if ( ! this.props.isInstall ) {
				return translate( 'Continue' );
			}

			return isSearch ? translate( 'Get Search' ) : translate( 'Start Installation' );
		}
		return translate( 'Setting up…' );
	}

	getTermsOfJetpackSyncUrl() {
		return localizeUrl( 'https://jetpack.com/support/what-data-does-jetpack-sync/' );
	}

	getTermsOfServiceUrl() {
		return localizeUrl( 'https://wordpress.com/tos/' );
	}

	isFormSubmitDisabled() {
		const { isError, url } = this.props;
		const hasError = isError && NOT_EXISTS !== isError;

		return ! url || hasError;
	}

	isFormSubmitBusy() {
		const { isFetching } = this.props;
		const { isUnloading } = this.state ?? {};

		return isFetching || isUnloading;
	}

	validateForm() {
		const { url, translate } = this.props;
		let errorMessage;

		if ( ! isValidUrl( url ) ) {
			errorMessage = translate( 'Please enter a valid URL.' );
		}

		if ( errorMessage ) {
			this.setState( { errorMessage } );
			return false;
		}

		return true;
	}

	handleFormSubmit = () => {
		const { onSubmit } = this.props;

		const isFormValid = this.validateForm();

		if ( isFormValid ) {
			onSubmit();
		}
	};

	handleChange = ( event ) => {
		const { onChange } = this.props;

		this.setState( { errorMessage: null } );
		onChange( event );
	};

	renderError() {
		const { errorMessage } = this.state;

		if ( errorMessage ) {
			return <FormInputValidation isError text={ errorMessage } />;
		}
	}

	renderTermsOfServiceLink() {
		return (
			<p className="jetpack-connect__tos-link">
				{ this.props.translate(
					'By setting up Jetpack you agree to our {{tosLinkText}}Terms of Service{{/tosLinkText}} ' +
						'and to sync {{syncLinkText}}certain data and settings{{/syncLinkText}} to WordPress.com',
					{
						components: {
							tosLinkText: (
								<a
									className="jetpack-connect__tos-link-text"
									href={ this.getTermsOfServiceUrl() }
									onClick={ this.props.handleOnClickTos }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
							syncLinkText: (
								<a
									className="jetpack-connect__sync-link-text"
									href={ this.getTermsOfJetpackSyncUrl() }
									onClick={ this.props.handleOnClickTos }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				) }
			</p>
		);
	}

	render() {
		const { candidateSites, isSearch, translate, url, autoFocus } = this.props;

		const isDisabled = this.isFormSubmitDisabled();
		const isBusy = this.isFormSubmitBusy();

		return (
			<div>
				<FormLabel htmlFor="siteUrl">{ translate( 'Site address' ) }</FormLabel>
				<div className="jetpack-connect__site-address-container">
					<Gridicon className="jetpack-connect__site-address-icon" size={ 24 } icon="domains" />
					{ ! isSearch && (
						<FormTextInput
							ref={ this.refInput }
							id="siteUrl"
							autoCapitalize="off"
							autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
							onChange={ this.handleChange }
							disabled={ isBusy }
							placeholder="https://yourjetpack.blog"
							onKeyUp={ this.handleKeyPress }
							value={ url }
						/>
					) }
					{ isSearch && (
						<SuggestionSearch
							id="siteSelection"
							placeholder="Type your site"
							onChange={ this.handleChange }
							suggestions={ candidateSites }
							value={ url }
						/>
					) }
					{ this.renderError() }
				</div>
				<Card className="jetpack-connect__connect-button-card">
					{ this.renderTermsOfServiceLink() }
					<Button
						className="jetpack-connect__connect-button"
						primary
						disabled={ isDisabled && ! isBusy }
						busy={ isBusy }
						onClick={ this.handleFormSubmit }
					>
						{ this.renderButtonLabel() }
					</Button>
				</Card>
			</div>
		);
	}
}

export default localize( JetpackConnectSiteUrlInput );
