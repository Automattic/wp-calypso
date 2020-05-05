/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import path from 'path';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { ALLOWED_FILE_EXTENSIONS } from './constants';
import { AspectRatios } from 'state/ui/editor/image-editor/constants';
import { Dialog } from '@automattic/components';
import FilePicker from 'components/file-picker';
import { getCurrentUser } from 'state/current-user/selectors';
import Gravatar from 'components/gravatar';
import { isCurrentUserUploadingGravatar } from 'state/current-user/gravatar-status/selectors';
import { resetAllImageEditorState } from 'state/ui/editor/image-editor/actions';
import Spinner from 'components/spinner';
import {
	receiveGravatarImageFailed,
	uploadGravatar,
} from 'state/current-user/gravatar-status/actions';
import ImageEditor from 'blocks/image-editor';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';
import VerifyEmailDialog from 'components/email-verification/email-verification-dialog';
import DropZone from 'components/drop-zone';
import { recordTracksEvent, recordGoogleEvent, composeAnalytics } from 'state/analytics/actions';

/**
 * Style dependencies
 */
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
				<Dialog additionalClassNames={ 'edit-gravatar-modal' } isVisible={ true }>
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

	render() {
		const { isUploading, translate, user } = this.props;
		const gravatarLink = `https://gravatar.com/${ user.username || '' }`;
		// use imgSize = 400 for caching
		// it's the popular value for large Gravatars in Calypso
		const GRAVATAR_IMG_SIZE = 400;
		const icon = user.email_verified ? 'cloud-upload' : 'notice';
		const buttonText = user.email_verified
			? translate( 'Click to change photo' )
			: translate( 'Verify your email' );
		/* eslint-disable jsx-a11y/click-events-have-key-events */
		/* eslint-disable jsx-a11y/no-static-element-interactions */
		return (
			<div
				className={ classnames(
					'edit-gravatar',
					{ 'is-unverified': ! user.email_verified },
					{ 'is-uploading': isUploading }
				) }
			>
				<div onClick={ this.handleUnverifiedUserClick }>
					<FilePicker accept="image/*" onPick={ this.onReceiveFile }>
						<div
							data-tip-target="edit-gravatar"
							className={ classnames( 'edit-gravatar__image-container', {
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
											href={ gravatarLink }
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
