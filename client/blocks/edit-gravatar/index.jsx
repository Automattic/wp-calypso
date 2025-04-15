import path from 'path';
import { Dialog, Gridicon, ExternalLink } from '@automattic/components';
import { GravatarQuickEditorCore } from '@gravatar-com/quick-editor';
import { Button } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import i18n, { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ImageEditor from 'calypso/blocks/image-editor';
import VerifyEmailDialog from 'calypso/components/email-verification/email-verification-dialog';
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
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import { ALLOWED_FILE_EXTENSIONS } from './constants';

import './style.scss';

export class EditGravatar extends Component {
	state = {
		isEditingImage: false,
		image: false,
		showEmailVerificationNotice: false,
		avatarUrlCacheVer: '',
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
	};

	quickEditor = null;

	componentDidMount() {
		const { user } = this.props;

		this.quickEditor = new GravatarQuickEditorCore( {
			email: user.email,
			scope: [ 'avatars' ],
			onProfileUpdated: () => this.setState( { avatarUrlCacheVer: Date.now() } ),
		} );
	}

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
		const doneButtonText = i18n.fixMe( {
			text: 'Upload photo',
			newCopy: i18n.translate( 'Upload photo' ),
			oldCopy: i18n.translate( 'Change My Photo' ),
		} );

		if ( this.state.isEditingImage ) {
			return (
				<Dialog additionalClassNames="edit-gravatar-modal" isVisible>
					<ImageEditor
						allowedAspectRatios={ [ AspectRatios.ASPECT_1X1 ] }
						media={ { src: this.state.image } }
						onDone={ this.onImageEditorDone }
						onCancel={ this.hideImageEditor }
						doneButtonText={ doneButtonText }
					/>
				</Dialog>
			);
		}
	}

	handleUnverifiedUserClick = () => {
		this.props.recordClickButtonEvent( { isVerified: this.props.user.email_verified } );

		if ( this.props.user.email_verified ) {
			return;
		}

		this.setState( {
			showEmailVerificationNotice: true,
		} );
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

	renderGravatarProfileHidden = ( { gravatarLink, translate } ) => {
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
									ExternalLink: <ExternalLink href={ gravatarLink } target="_blank" icon />,
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
			recordClickButtonEvent,
		} = this.props;
		const gravatarLink = 'https://gravatar.com';
		// use imgSize = 400 for caching
		// it's the popular value for large Gravatars in Calypso
		const GRAVATAR_IMG_SIZE = 400;
		// eslint-disable-next-line no-unused-vars
		const uploadButtonLabel = user.email_verified
			? translate( 'Change profile photo' )
			: translate( 'Verify your email to change profile photo' );

		if ( this.props.isFetchingUserSettings ) {
			return this.renderEditGravatarIsLoading();
		}

		if ( isGravatarProfileHidden ) {
			return this.renderGravatarProfileHidden( { gravatarLink, translate } );
		}

		const avatarUrl = addQueryArgs( user.avatar_URL, { ver: this.state.avatarUrlCacheVer } );

		return (
			<div
				className={ clsx(
					'edit-gravatar',
					{ 'is-unverified': ! user.email_verified },
					{ 'is-uploading': isUploading }
				) }
			>
				{ /* <FilePicker accept="image/*" onPick={ this.onReceiveFile }>
					<button
						type="button"
						onClick={ this.handleUnverifiedUserClick }
						className="edit-gravatar__image-button"
						aria-label={ uploadButtonLabel }
					>
						<div
							data-tip-target="edit-gravatar"
							className={ clsx( 'edit-gravatar__image-container', {
								'is-uploading': isUploading,
							} ) }
						>
							{ user.email_verified && (
								<DropZone
									textLabel={ translate( 'Drop to upload profile photo' ) }
									onFilesDrop={ this.onReceiveFile }
								/>
							) }
							<Gravatar imgSize={ GRAVATAR_IMG_SIZE } size={ 150 } user={ user } />
							<div className="edit-gravatar__label-container">
								<div className="edit-gravatar__label-container-icon">
									{ ! user.email_verified && (
										<Icon className="gridicon" icon={ caution } fill="#fff" size={ 24 } />
									) }

									{ user.email_verified && ! isUploading && (
										<Icon className="gridicon" icon={ upload } fill="#fff" size={ 24 } />
									) }

									{ user.email_verified && isUploading && (
										<Spinner
											style={ {
												width: 24,
												height: 24,
											} }
											className="edit-gravatar__label-container-icon-spinner"
										/>
									) }
								</div>
							</div>
						</div>
					</button>
				</FilePicker> */ }
				{ /* { this.renderImageEditor() } */ }
				{ this.state.showEmailVerificationNotice && (
					<VerifyEmailDialog onClose={ this.closeVerifyEmailDialog } />
				) }
				<Gravatar
					imgSize={ GRAVATAR_IMG_SIZE }
					size={ 150 }
					user={ { avatar_URL: avatarUrl, display_name: user.display_name } }
				/>
				<div>
					{ /* <p className="edit-gravatar__explanation">
						{ translate( 'Your profile photo is public.' ) }
					</p> */ }
					{ /* <InfoPopover className="edit-gravatar__pop-over" position="left">
						{ translate(
							'{{p}}The avatar you upload here is synced with {{ExternalLink}}Gravatar{{/ExternalLink}}.' +
								' If you do not have a Gravatar account, one will be created for you when you upload your first image.{{/p}}',
							{
								components: {
									ExternalLink: <ExternalLink href={ gravatarLink } target="_blank" icon />,
									p: <p />,
								},
							}
						) }
					</InfoPopover> */ }
					<Button
						className="edit-gravatar__edit-avatar-button"
						variant="link"
						onClick={ () => {
							recordClickButtonEvent( { isVerified: user.email_verified } );

							this.quickEditor?.open();
						} }
					>
						{ translate( 'Edit your public avatar' ) }
					</Button>
					{ additionalUploadHtml && (
						<FilePicker accept="image/*" onPick={ this.onReceiveFile }>
							{ additionalUploadHtml }
						</FilePicker>
					) }
				</div>
			</div>
		);
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
	} ),
	{
		resetAllImageEditorState,
		receiveGravatarImageFailed,
		uploadGravatar,
		recordClickButtonEvent,
		recordReceiveImageEvent,
	}
)( localize( EditGravatar ) );
