/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { debounce, get } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import FormTextInputWithAction from 'components/forms/form-text-input-with-action';
//import FormInputValidation from 'components/forms/form-input-validation';
import { fetchIsSiteImportable } from 'lib/importer/actions';

const debug = debugFactory( 'calypso:signup-step-import-url' );

const DEBOUNCE_CHECK_INTERVAL = 1200;

const normalizeUrlForImportSource = url => {
	// @TODO sanitize? Prepend https:// ..?
	return url;
};

class ImportURLStepComponent extends Component {
	state = { formDisabled: false, url: '' };

	componentDidMount() {
		const { queryObject } = this.props;
		const urlFromQueryArg = normalizeUrlForImportSource( get( queryObject, 'url' ) );

		if ( urlFromQueryArg ) {
			this.fetchIsSiteImportable( urlFromQueryArg );
		}
	}

	handleAction = importUrl => {
		event.preventDefault();
		debug( { importUrl } );

		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {
			importUrl,
			themeSlugWithRepo: 'pub/radcliffe-2',
		} );

		this.props.goToNextStep();
	};

	handleInputChange = value => {
		this.setState( { url: value }, () => this.debouncedFetchIsSiteImportable( this.state.url ) );
	};

	clearFormDisabled = () => this.setState( { formDisabled: false } );

	handleIsSiteImportableResponse = ( { engine, error, favicon, site_title, site_url } ) => {
		if ( error ) {
			debug( 'Import not supported for site', { error } );
			this.clearFormDisabled();
			return;
		}

		switch ( engine ) {
			default:
				debug( 'Import not supported for engine:', { engine } );
				break;
			case 'wix':
				debug( 'Import supported for site:', { engine, favicon, site_title, site_url } );
				break;
		}

		this.clearFormDisabled();
	};

	fetchIsSiteImportable = () => {
		// @TODO redux..
		if ( ! this.state.url ) {
			this.clearFormDisabled();
			return;
		}

		this.setState( { formDisabled: true } );

		const normalizedUrl = normalizeUrlForImportSource( this.state.url );

		this.props.fetchIsSiteImportable( normalizedUrl ).then( this.handleIsSiteImportableResponse );
	};

	debouncedFetchIsSiteImportable = debounce( this.fetchIsSiteImportable, DEBOUNCE_CHECK_INTERVAL );

	renderContent = () => {
		return (
			<div className="import-url__wrapper">
				<FormTextInputWithAction
					placeholder="Enter the URL of your existing site"
					action="Continue"
					onAction={ this.handleAction }
					label={ this.props.translate( 'URL' ) }
					onChange={ this.handleInputChange }
					disabled={ this.state.formDisabled }
					value={ this.state.url }
				/>
				{ /* <FormInputValidation text="..." /> */ }
				<ButtonGroup>
					<Button>Skip</Button>
				</ButtonGroup>
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

export default connect(
	null,
	{ fetchIsSiteImportable }
)( localize( ImportURLStepComponent ) );
