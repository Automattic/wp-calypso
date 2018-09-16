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
import { setNuxUrlInputValue, setValidationMessage, fetchIsSiteImportable, fetchSitePreviewImage } from 'state/importer-nux/actions';
import FormInputValidation from 'components/forms/form-input-validation';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import {
	getNuxUrlInputValue,
	getSiteDetails,
	getUrlInputValidationMessage,
	isIsSiteImportableFetching,
	isSiteImportableFetching,
} from 'state/importer-nux/temp-selectors';

import MiniSitePreview from 'components/mini-site-preview';

const normalizeUrlForImportSource = url => {
	// @TODO sanitize? Prepend https:// ..?
	return url;
};

class ImportURLStepComponent extends Component {
	componentDidMount() {
		const { importUrl } = this.props;
		const normalizedUrl = normalizeUrlForImportSource( importUrl )
		console.log( 'mounting confirmation', { normalizedUrl } );
		this.props.fetchIsSiteImportable( normalizedUrl );
	}

	state = {
		previewRetries: 0,
		sitePreviewImage: '',
		sitePreviewFailed: false,
		loadingPreviewImage: true,
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

	renderContent = () => {
		const { isIsSiteImportableFetching, isInputDisabled, sitePreview, urlInputValidationMessage, urlInputValue, translate } = this.props;
		const {
			siteURL,
			sitePreviewImage,
			sitePreviewFailed,
			loadingPreviewImage,
		} = state;

		console.log( {
			isIsSiteImportableFetching,
			'sitePreview.fetching': sitePreview.fetching,
		} )

		if ( isIsSiteImportableFetching ) {
			return (
				<div className="import-url__wrapper">
					<h2>Fetching is site importable</h2>
				</div>
			);
		}

		if ( sitePreview.fetching ) {
			return (
				<div className="import-url__wrapper">
					<h2>Fetching site preview</h2>
				</div>
			);
		}

		return (
			<div className="import-url__wrapper">
				{ loadingPreviewImage && <h2>Loading</h2> }
				{ sitePreviewImage && (
					<MiniSitePreview imageSrc={ this.state.sitePreviewImage } />
				) }
				{ sitePreviewFailed && <h2>Failed</h2> }
			</div>
		);
	};

	render() {
		const { importUrl, flowName, positionInFlow, signupProgress, stepName, translate, sitePreview } = this.props;

		const headerText = translate( 'One moment please.')
		const subHeaderText = translate(
			"We're looking for your site at %(url)s",
			{ args: { url: importUrl } }
		);

		console.log( sitePreview );

		return (
			<StepWrapper
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
		( state, ownProps ) => ( {
			importUrl: get( ownProps, 'signupDependencies.importUrl' ),
			sitePreview: get( state, 'importerNux.sitePreview' ),
			urlInputValue: getNuxUrlInputValue( state ),
			siteDetails: getSiteDetails( state ),
			isInputDisabled: isIsSiteImportableFetching( state ),
			urlInputValidationMessage: getUrlInputValidationMessage( state ),
			isIsSiteImportableFetching: isSiteImportableFetching( state ),
		} ),
		{
			setNuxUrlInputValue,
			setValidationMessage,
			fetchIsSiteImportable,
		}
	),
	localize
)( ImportURLStepComponent );
