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

const normalizeUrlForImportSource = url => {
	// @TODO sanitize? Prepend https:// ..?
	return url;
};

class ImportURLStepComponent extends Component {
	state = { formDisabled: true, url: null };

	componentDidMount() {
		const { queryObject } = this.props;
		const urlFromQueryArg = normalizeUrlForImportSource( get( queryObject, 'url' ) );

		if ( urlFromQueryArg ) {
			this.debouncedHandleChange( urlFromQueryArg );
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

	handleChange = enteredValue => {
		this.setState( {
			url: normalizeUrlForImportSource( enteredValue ),
		} );
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

		this.props.fetchIsSiteImportable( this.state.url ).then( this.handleIsSiteImportableResponse );
	};

	componentDidUpdate( prevProps, prevState ) {
		if ( this.state.url === prevState.url ) {
			return;
		}

		this.fetchIsSiteImportable();
	}

	debouncedHandleChange = debounce( this.handleChange, 1200 );

	renderContent = () => {
		return (
			<div className="import-url__wrapper">
				<FormTextInputWithAction
					placeholder="Enter the URL of your existing site"
					action="Continue"
					onAction={ this.handleAction }
					label={ this.props.translate( 'URL' ) }
					onChange={ this.debouncedHandleChange }
					disabled={ this.state.formDisabled }
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
