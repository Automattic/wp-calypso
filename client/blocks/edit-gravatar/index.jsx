import path from 'path';
import { Dialog, Gridicon, Spinner } from '@automattic/components';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ImageEditor from 'calypso/blocks/image-editor';
import QueryConnectedApplications from 'calypso/components/data/query-connected-applications';
import DropZone from 'calypso/components/drop-zone';
import VerifyEmailDialog from 'calypso/components/email-verification/email-verification-dialog';
import ExternalLink from 'calypso/components/external-link';
import FilePicker from 'calypso/components/file-picker';
import Gravatar from 'calypso/components/gravatar';
import InfoPopover from 'calypso/components/info-popover';
import {
	recordTracksEvent,
	recordGoogleEvent,
	composeAnalytics,
} from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { resetAllImageEditorState } from 'calypso/state/editor/image-editor/actions';
import { AspectRatios } from 'calypso/state/editor/image-editor/constants';
import { receiveGravatarImageFailed, uploadGravatar } from 'calypso/state/gravatar-status/actions';
import { isCurrentUserUploadingGravatar } from 'calypso/state/gravatar-status/selectors';
import getConnectedApplications from 'calypso/state/selectors/get-connected-applications';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import { ALLOWED_FILE_EXTENSIONS } from './constants';

import './style.scss';

export class EditGravatar extends Component {
	state = {
		isEditingImage: false,
		image: false,
		showEmailVerificationNotice: false,
	};

	static propTypes = {
		isUploading: PropTypes.bool,
		translate: PropTypes.func,
		receiveGravatarImageFailed: PropTypes.func,
		resetAllImageEditorState: PropTypes.func,
		uploadGravatar: PropTypes.func,
		user: PropTypes.object,
		recordClickButtonEvent: PropTypes.func,
		recordReceiveImageEvent: PropTypes.func,
		connectedApps: PropTypes.array,
		editImageOnGravatar: PropTypes.bool,
	};

	onReceiveFile = ( files ) => {
		const {
			receiveGravatarImageFailed: receiveGravatarImageFailedAction,
			translate,
			recordReceiveImageEvent,
		} = this.props;
		const extension = path.extname( files[ 0 ].name ).toLowerCase().substring( 1 );

		recordReceiveImageEvent();

		if ( ALLOWED_FILE_EXTENSIONS.indexOf( extension ) === -1 ) {
			let errorMessage = '';

			if ( extension ) {
				errorMessage = translate(
					'Sorry, %s files are not supported' +
						' — please make sure your image is in JPG, GIF, or PNG format.',
					{
						args: extension,
					}
				);
			} else {
				errorMessage = translate(
					'Sorry, images of that filetype are not supported ' +
						'— please make sure your image is in JPG, GIF, or PNG format.'
				);
			}

			receiveGravatarImageFailedAction( {
				errorMessage,
				statName: 'bad_filetype',
			} );
			return;
		}

		const imageObjectUrl = URL.createObjectURL( files[ 0 ] );
		this.setState( {
			isEditingImage: true,
			image: imageObjectUrl,
		} );
	};

	onImageEditorDone = ( error, imageBlob ) => {
		const {
			receiveGravatarImageFailed: receiveGravatarImageFailedAction,
			translate,
			uploadGravatar: uploadGravatarAction,
			user,
		} = this.props;

		this.hideImageEditor();

		if ( error ) {
			receiveGravatarImageFailedAction( {
				errorMessage: translate( "We couldn't save that image — please try another one." ),
				statName: 'image_editor_error',
			} );
			return;
		}

		// send gravatar request
		uploadGravatarAction( imageBlob, user.email );
	};

	hideImageEditor = () => {
		const { resetAllImageEditorState: resetAllImageEditorStateAction } = this.props;
		resetAllImageEditorStateAction();
		URL.revokeObjectURL( this.state.image );
		this.setState( {
			isEditingImage: false,
			image: false,
		} );
	};

	renderImageEditor() {
		if ( this.state.isEditingImage ) {
			return (
				<Dialog additionalClassNames="edit-gravatar-modal" isVisible={ true }>
					<ImageEditor
						allowedAspectRatios={ [ AspectRatios.ASPECT_1X1 ] }
						media={ { src: this.state.image } }
						onDone={ this.onImageEditorDone }
						onCancel={ this.hideImageEditor }
						doneButtonText={ this.props.translate( 'Change My Photo' ) }
					/>
				</Dialog>
			);
		}
	}

	handleUserClick = ( isEditImageOnGravatar, gravatarManagementLink ) => {
		this.props.recordClickButtonEvent( { isVerified: this.props.user.email_verified } );

		if ( ! this.props.user.email_verified ) {
			this.setState( {
				showEmailVerificationNotice: true,
			} );
		} else if ( isEditImageOnGravatar ) {
			window.open( gravatarManagementLink, '_blank' );
		}
	};

	closeVerifyEmailDialog = () => {
		this.setState( {
			showEmailVerificationNotice: false,
		} );
	};

	renderEditGravatarIsLoading = () => {
		return (
			<div className="edit-gravatar edit_gravatar__is-loading">
				<div className="edit-gravatar__image-container">
					<div className="edit-gravatar__gravatar-placeholder"></div>
				</div>
				<div>
					<p className="edit-gravatar__explanation edit-gravatar__explanation-placeholder"></p>
				</div>
			</div>
		);
	};

	renderGravatarProfileHidden = ( { gravatarProfileLink, translate } ) => {
		return (
			<div className="edit-gravatar">
				<div className="edit-gravatar__image-container">
					<div className="edit-gravatar__gravatar-is-hidden">
						<div className="edit-gravatar__label-container">
							<Gridicon
								icon="user"
								size={ 96 } /* eslint-disable-line wpcalypso/jsx-gridicon-size */
							/>
						</div>
					</div>
				</div>
				<div>
					<p className="edit-gravatar__explanation">
						{ translate( 'Your profile photo is hidden.' ) }
					</p>
					<InfoPopover className="edit-gravatar__pop-over" position="left">
						{ translate(
							'{{p}}The avatar you use on WordPress.com comes ' +
								'from {{ExternalLink}}Gravatar{{/ExternalLink}}, a universal avatar service ' +
								'(it stands for "Globally Recognized Avatar," get it?).{{/p}}' +
								'{{p}}However, your photo and Gravatar profile are hidden, preventing' +
								' them from appearing on any site.{{/p}}',
							{
								components: {
									ExternalLink: (
										<ExternalLink
											href={ gravatarProfileLink }
											target="_blank"
											rel="noopener noreferrer"
											icon={ true }
										/>
									),
									p: <p />,
								},
							}
						) }
					</InfoPopover>
				</div>
			</div>
		);
	};

	render() {
		const {
			isGravatarProfileHidden,
			isUploading,
			translate,
			user,
			additionalUploadHtml,
			connectedApps,
			editImageOnGravatar,
		} = this.props;
		const gravatarProfileLink = `https://gravatar.com/${ user.username || '' }`;
		const gravatarManagementLink = 'https://gravatar.com/emails';
		// use imgSize = 400 for caching
		// it's the popular value for large Gravatars in Calypso
		const GRAVATAR_IMG_SIZE = 400;
		const hasConnectedToGravatar = connectedApps.find( ( { title } ) => title === 'Gravatar' );
		const isEditImageOnGravatar = editImageOnGravatar && hasConnectedToGravatar;

		if ( this.props.isFetchingUserSettings ) {
			return this.renderEditGravatarIsLoading();
		}

		if ( isGravatarProfileHidden ) {
			return this.renderGravatarProfileHidden( { gravatarProfileLink, translate } );
		}

		let icon = user.email_verified ? 'cloud-upload' : 'notice';
		let buttonText = user.email_verified
			? translate( 'Click to change photo' )
			: translate( 'Verify your email' );

		if ( user.email_verified && isEditImageOnGravatar ) {
			icon = 'external';
			buttonText = translate( 'Claim your Gravatar' );
		}

		/* eslint-disable jsx-a11y/click-events-have-key-events */
		/* eslint-disable jsx-a11y/no-static-element-interactions */
		return (
			<div
				className={ classnames( 'edit-gravatar', {
					'is-unverified': ! user.email_verified,
					'is-uploading': isUploading,
					'is-edit-image-on-gravatar': isEditImageOnGravatar,
				} ) }
			>
				<QueryConnectedApplications />
				<div
					onClick={ () => this.handleUserClick( isEditImageOnGravatar, gravatarManagementLink ) }
				>
					<FilePicker accept="image/*" onPick={ this.onReceiveFile }>
						<div
							data-tip-target="edit-gravatar"
							className={ classnames( 'edit-gravatar__image-container', {
								'is-uploading': isUploading,
							} ) }
						>
							{ user.email_verified && ! isEditImageOnGravatar && (
								<DropZone
									textLabel={ translate( 'Drop to upload profile photo' ) }
									onFilesDrop={ this.onReceiveFile }
								/>
							) }
							<Gravatar imgSize={ GRAVATAR_IMG_SIZE } size={ 150 } user={ user } />
							{ ! isUploading && (
								<div className="edit-gravatar__label-container">
									<Gridicon icon={ icon } size={ 36 } />
									<span className="edit-gravatar__label">{ buttonText }</span>
								</div>
							) }
							{ isUploading && <Spinner className="edit-gravatar__spinner" /> }
						</div>
					</FilePicker>
				</div>
				{ this.state.showEmailVerificationNotice && (
					<VerifyEmailDialog onClose={ this.closeVerifyEmailDialog } />
				) }
				{ this.renderImageEditor() }
				<div>
					<p className="edit-gravatar__explanation">
						{ translate( 'Your profile photo is public.' ) }
					</p>
					<InfoPopover className="edit-gravatar__pop-over" position="left">
						{ translate(
							'{{p}}The avatar you use on WordPress.com comes ' +
								'from {{ExternalLink}}Gravatar{{/ExternalLink}}, a universal avatar service ' +
								'(it stands for "Globally Recognized Avatar," get it?).{{/p}}' +
								'{{p}}Your image may also appear on other sites using Gravatar ' +
								"whenever you're logged in with the email %(email)s.{{/p}}",
							{
								components: {
									ExternalLink: (
										<ExternalLink
											href={ gravatarProfileLink }
											target="_blank"
											rel="noopener noreferrer"
											icon={ true }
										/>
									),
									p: <p />,
								},
								args: {
									email: user.email,
								},
							}
						) }
					</InfoPopover>
					{ additionalUploadHtml && (
						<FilePicker accept="image/*" onPick={ this.onReceiveFile }>
							{ additionalUploadHtml }
						</FilePicker>
					) }
				</div>
			</div>
		);
		/* eslint-enable jsx-a11y/click-events-have-key-events */
		/* eslint-enable jsx-a11y/no-static-element-interactions */
	}
}

const recordClickButtonEvent = ( { isVerified } ) =>
	composeAnalytics(
		recordTracksEvent( 'calypso_edit_gravatar_click', { user_verified: isVerified } ),
		recordGoogleEvent( 'Me', 'Clicked on Edit Gravatar Button in Profile' )
	);

const recordReceiveImageEvent = () => recordTracksEvent( 'calypso_edit_gravatar_file_receive' );

export default connect(
	( state ) => ( {
		user: getCurrentUser( state ) || {},
		isFetchingUserSettings: isFetchingUserSettings( state ),
		isGravatarProfileHidden: getUserSetting( state, 'gravatar_profile_hidden' ),
		isUploading: isCurrentUserUploadingGravatar( state ),
		connectedApps: getConnectedApplications( state ) || [],
	} ),
	{
		resetAllImageEditorState,
		receiveGravatarImageFailed,
		uploadGravatar,
		recordClickButtonEvent,
		recordReceiveImageEvent,
	}
)( localize( EditGravatar ) );
