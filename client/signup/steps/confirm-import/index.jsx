/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { defer, get } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import SiteMockup from 'components/site-mockup';
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import { withoutHttp } from 'lib/url';

import './styles.scss';

class ImportURLStepComponent extends Component {
	state = {
		// We'll use showSitePreview to trigger a reveal animation after mounting
		showSitePreview: false,
	};

	componentDidMount() {
		defer( this.showSitePreview );
	}

	showSitePreview = () => this.setState( { showSitePreview: true } );

	handleConfirmationClick = () => {
		SignupActions.submitSignupStep( {
			processingMessage: this.props.translate( 'Setting up your site' ),
			stepName: this.props.stepName,
		} );

		this.props.goToNextStep();
	};

	handleCancelClick = () => this.props.goToStep( 'import-url' );

	renderContent = () => {
		const { translate, signupDependencies: { importUrl } = {} } = this.props;
		const previewImageSrc = get( this.props, 'signupDependencies.sitePreviewImageBlob' );
		const siteMockupClasses = classnames( 'confirm-import__site-mockup', {
			[ 'is-hidden' ]: ! this.state.showSitePreview,
		} );

		return (
			<div className="confirm-import__wrapper">
				<div className="confirm-import__action-buttons">
					<Button onClick={ this.handleCancelClick }>
						{ translate( 'No, go back.', { context: 'Go back to the previous step and retry' } ) }
					</Button>
					<Button primary onClick={ this.handleConfirmationClick }>
						{ translate( 'Yep! this is my site!' ) }
					</Button>
				</div>
				<SiteMockup
					className={ siteMockupClasses }
					size="desktop"
					renderContent={
						previewImageSrc
							? () => (
									<img
										src={ previewImageSrc }
										alt={ `Preview Screenshot of site: ${ withoutHttp( importUrl ) }` }
									/>
							  )
							: null
					}
				/>
			</div>
		);
	};

	render() {
		const {
			flowName,
			positionInFlow,
			signupDependencies: { importUrl } = {},
			signupProgress,
			stepName,
			translate,
		} = this.props;
		const headerText = translate( 'Is this your site?' );
		const subHeaderText = translate(
			"Here's what we found at {{strong}}%(importUrl)s{{/strong}}, please take a moment to confirm that this is your site.",
			{
				args: { importUrl: withoutHttp( importUrl ) },
				components: { strong: <strong /> },
			}
		);

		return (
			<StepWrapper
				className="confirm-import"
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				fallbackSubHeaderText={ subHeaderText }
				signupProgress={ signupProgress }
				stepContent={ this.renderContent() }
			/>
		);
	}
}

export default localize( ImportURLStepComponent );
