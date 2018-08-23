/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { debounce, flow, get } from 'lodash';
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
import { fetchIsSiteImportable, setNuxUrlInputValue } from 'state/importer-nux/actions';
import {
	getNuxUrlInputValue,
	getSiteDetails,
	isUrlInputDisabled,
} from 'state/importer-nux/temp-selectors';

const debug = debugFactory( 'calypso:signup-step-import-url' );

const DEBOUNCE_CHECK_INTERVAL = 1200;

const normalizeUrlForImportSource = url => {
	// @TODO sanitize? Prepend https:// ..?
	return url;
};

class ImportURLStepComponent extends Component {
	state = { formDisabled: false };

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
		this.props.setNuxUrlInputValue( value );
		this.debouncedFetchIsSiteImportable( normalizeUrlForImportSource( value ) );
	};

	clearFormDisabled = () => this.setState( { formDisabled: false } );

	fetchIsSiteImportable = () => {
		if ( ! this.props.urlInputValue ) {
			this.clearFormDisabled();
			return;
		}

		this.setState( { formDisabled: true } );

		const normalizedUrl = normalizeUrlForImportSource( this.props.urlInputValue );

		this.props.fetchIsSiteImportable( normalizedUrl );
	};

	debouncedFetchIsSiteImportable = debounce( this.fetchIsSiteImportable, DEBOUNCE_CHECK_INTERVAL );

	renderContent = () => {
		const { isInputDisabled, urlInputValue, translate } = this.props;

		return (
			<div className="import-url__wrapper">
				<FormTextInputWithAction
					placeholder="Enter the URL of your existing site"
					action="Continue"
					onAction={ this.handleAction }
					label={ translate( 'URL' ) }
					onChange={ this.handleInputChange }
					disabled={ isInputDisabled }
					value={ urlInputValue }
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

export default flow(
	connect(
		state => ( {
			urlInputValue: getNuxUrlInputValue( state ),
			siteDetails: getSiteDetails( state ),
			isInputDisabled: isUrlInputDisabled( state ),
		} ),
		{
			fetchIsSiteImportable,
			setNuxUrlInputValue,
		}
	),
	localize
)( ImportURLStepComponent );
