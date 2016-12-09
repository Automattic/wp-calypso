/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import path from 'path';

/**
 * Internal dependencies
 */
import { ALLOWED_FILE_EXTENSIONS } from './constants';
import { AspectRatios } from 'state/ui/editor/image-editor/constants';
import Button from 'components/button';
import Dialog from 'components/dialog';
import FilePicker from 'components/file-picker';
import FormLabel from 'components/forms/form-label';
import { getCurrentUser } from 'state/current-user/selectors';
import { getToken as getOauthToken } from 'lib/oauth-token';
import Gravatar from 'components/gravatar';
import {
	isCurrentUserUploadingGravatar,
} from 'state/current-user/gravatar-status/selectors';
import { isOffline } from 'state/application/selectors';
import {
	resetAllImageEditorState
} from 'state/ui/editor/image-editor/actions';
import Spinner from 'components/spinner';
import {
	receiveGravatarImageFailed,
	uploadGravatar
} from 'state/current-user/gravatar-status/actions';
import ImageEditor from 'blocks/image-editor';

/**
 * Module dependencies
 */
const debug = debugFactory( 'calypso:edit-gravatar' );

export class EditGravatar extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			isEditingImage: false,
			image: false
		};
	}

	static propTypes = {
		isOffline: PropTypes.bool,
		isUploading: PropTypes.bool,
		translate: PropTypes.func,
		receiveGravatarImageFailed: PropTypes.func,
		resetAllImageEditorState: PropTypes.func,
		uploadGravatar: PropTypes.func,
		user: PropTypes.object,
	};

	onReceiveFile = ( files ) => {
		const {
			receiveGravatarImageFailed: receiveGravatarImageFailedAction,
			translate
		} = this.props;
		const extension = path.extname( files[ 0 ].name )
			.toLowerCase()
			.substring( 1 );

		if ( ALLOWED_FILE_EXTENSIONS.indexOf( extension ) === -1 ) {
			let errorMessage = '';

			if ( extension ) {
				errorMessage = translate(
					'An image of filetype %s is not allowed',
					{
						args: extension
					}
				);
			} else {
				errorMessage = translate( 'An image of that filetype is not allowed' );
			}

			receiveGravatarImageFailedAction( errorMessage );
			return;
		}

		const imageObjectUrl = URL.createObjectURL( files[ 0 ] );
		this.setState( {
			isEditingImage: true,
			image: imageObjectUrl
		} );
	};

	onImageEditorDone = ( error, imageBlob ) => {
		const {
			receiveGravatarImageFailed: receiveGravatarImageFailedAction,
			translate,
			uploadGravatar: uploadGravatarAction,
			user
		} = this.props;

		this.hideImageEditor();

		if ( error ) {
			receiveGravatarImageFailedAction(
				translate( "We couldn't save that image, please try another one" )
			);
			return;
		}

		// check for bearerToken from desktop app
		let bearerToken = getOauthToken();

		// check for bearer token from local storage - for testing purposes
		if ( ! bearerToken ) {
			bearerToken = localStorage.getItem( 'bearerToken' );
		}

		// send gravatar request
		if ( bearerToken ) {
			debug( 'Got the bearerToken, sending request' );
			uploadGravatarAction( imageBlob, bearerToken, user.email );
		} else {
			receiveGravatarImageFailedAction(
				translate( "We can't save a new Gravatar now. Please try again later." )
			);
		}
	};

	hideImageEditor = () => {
		const {
			resetAllImageEditorState: resetAllImageEditorStateAction
		} = this.props;
		resetAllImageEditorStateAction();
		URL.revokeObjectURL( this.state.image );
		this.setState( {
			isEditingImage: false,
			image: false
		} );
	};

	renderImageEditor() {
		if ( this.state.isEditingImage ) {
			return (
				<Dialog
					additionalClassNames={ 'edit-gravatar-modal' }
					isVisible={ true }
				>
					<ImageEditor
						allowedAspectRatios={ [ AspectRatios.ASPECT_1X1 ] }
						media={ { src: this.state.image } }
						onDone={ this.onImageEditorDone }
						onCancel={ this.hideImageEditor }
					/>
				</Dialog>
			);
		}
	}

	render() {
		const {
			isOffline: userIsOffline,
			isUploading,
			translate,
			user
		} = this.props;
		return (
			<div>
				{ this.renderImageEditor() }
				<FormLabel>
					{
						translate( 'Avatar', {
							comment: 'A section heading on the profile page.'
						} )
					}
				</FormLabel>
				<div
					className={
						classnames( 'edit-gravatar__image-container',
							{ 'is-uploading': isUploading }
						)
					}
				>
					<Gravatar
						imgSize={ 270 }
						size={ 100 }
						user={ user }
					/>
					{ isUploading && <Spinner className="edit-gravatar__spinner" /> }
				</div>
				<p>
					{
						translate( 'To change, select an image or ' +
							'drag and drop a picture from your computer.' )
					}
				</p>
				<FilePicker accept="image/*" onPick={ this.onReceiveFile }>
					<Button
						disabled={ userIsOffline || isUploading || ! user.email_verified }
					>
						{ translate( 'Select Image' ) }
					</Button>
				</FilePicker>
			</div>
		);
	}
}

export default connect(
	state => ( {
		user: getCurrentUser( state ),
		isOffline: isOffline( state ),
		isUploading: isCurrentUserUploadingGravatar( state ),
	} ),
	{
		resetAllImageEditorState,
		receiveGravatarImageFailed,
		uploadGravatar
	}
)( localize( EditGravatar ) );
