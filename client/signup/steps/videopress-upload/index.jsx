import { createRef } from '@wordpress/element';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import WPCOMTus from 'wpcom';
import DropZone from 'calypso/components/drop-zone';
import FormButton from 'calypso/components/forms/form-button';
import wpcom from 'calypso/lib/wp';
import { VIDEOPRESS_ONBOARDING_FLOW_STEPS } from 'calypso/signup/config/constants';
import VideoPressStepWrapper from 'calypso/signup/videopress-step-wrapper';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { getSiteId } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

const TusUploader = WPCOMTus.TusUploader;

// prerequisites.
// * site, user, paid for.
// * useUploader from calypso.
// * edit video gui
// * when editing, how can I go back to viewing all uploads?
// * Finish button
// * skip this step button.

// const videoFiles = this.filterFilesUploadableOnVideoPress( files );
// if ( videoFiles.length ) {
// 	const uploader = new TusUploader( this.wpcom, this._sid );
// 	return uploader.startUpload( videoFiles );
// }

class VideoPressUpload extends Component {
	static displayName = 'VideoPressUpload';

	constructor( props ) {
		super( props );
	}

	componentWillUnmount() {
		this.save();
	}

	customizeSiteInput = createRef();

	handleSubmit = ( event ) => {
		event.preventDefault();
	};

	save = () => {
		// this.props.saveSignupStep( {
		// 	stepName: 'videopress-upload',
		// 	form: this.state.form, // Should we persist already uploaded video ids?
		// } );
	};

	onFilesDrop = ( files ) => {
		if ( 0 === files.length ) {
			return;
		}
		const videoFile = files[ 0 ];
		if ( videoFile.type.indexOf( 'video/' ) !== 0 ) {
			// TODO: error
			return;
		}
		const { siteId } = this.props;
		const noop = () => {};
		const uploader = new TusUploader( wpcom, siteId );
		uploader.performOnboardingVideoUpload( [ videoFile ], {
			onError: noop,
			onSuccess: noop,
			onProgress: noop,
		} );
	};

	formFields = () => {
		return (
			<>
				<div className="videopress-upload__dropzone">
					<DropZone onFilesDrop={ this.onFilesDrop } />
				</div>
			</>
		);
	};

	buttonText = () => {
		return this.props.translate( 'Finish' );
	};

	render() {
		return (
			<>
				<VideoPressStepWrapper
					className="videopress-upload__create"
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					stepIndicator={ this.props.translate( 'Step %(currentStep)s of %(totalSteps)s', {
						args: {
							currentStep: 3,
							totalSteps: VIDEOPRESS_ONBOARDING_FLOW_STEPS,
						},
					} ) }
					positionInFlow={ this.props.positionInFlow }
					headerText={ this.props.translate( 'Name your site' ) }
					subHeaderText={ this.props.translate( 'Customize some details about your new site' ) }
				>
					<form className="videopress-upload__form" onSubmit={ this.handleSubmit } noValidate>
						{ this.formFields() }
						<div className="videopress-upload__form-footer">
							<FormButton className="videopress-upload__form-submit-btn">
								{ this.buttonText() }
							</FormButton>
						</div>
					</form>

					<div className="videopress-upload__learn-more">
						<a href="https://videopress.com/" className="videopress-upload__learn-more-link">
							{ this.props.translate( 'Learn more about VideoPress' ) }
						</a>
					</div>
				</VideoPressStepWrapper>
			</>
		);
	}
}

export default connect( ( state ) => {
	const signupDependencies = getSignupDependencyStore( state );

	const siteId = getSelectedSiteId( state ) || getSiteId( state, signupDependencies.siteSlug );

	return {
		signupDependencies,
		isLoggedIn: isUserLoggedIn( state ),
		siteId,
	};
}, {} )( localize( VideoPressUpload ) );
