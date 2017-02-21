/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import path from 'path';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { ALLOWED_FILE_EXTENSIONS } from './constants';
import { AspectRatios } from 'state/ui/editor/image-editor/constants';
import Dialog from 'components/dialog';
import FilePicker from 'components/file-picker';
import { getCurrentUser } from 'state/current-user/selectors';
import { getToken as getOauthToken } from 'lib/oauth-token';
import Gravatar from 'components/gravatar';
import {
	isCurrentUserUploadingGravatar,
} from 'state/current-user/gravatar-status/selectors';
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

	renderInstructionText() {
		return (
			<div className="edit-gravatar__label-container">
				<Gridicon icon="cloud-upload" size={ 36 } />
				<span className="edit-gravatar__label">
					{ this.props.translate( 'Click to change photo' ) }
				</span>
			</div>
		);
	}

	render() {
		const {
			isUploading,
			user
		} = this.props;
		return (
			<div className="edit-gravatar">
				{ this.renderImageEditor() }
				<FilePicker accept="image/*" onPick={ this.onReceiveFile }>
					<div
						className={
							classnames( 'edit-gravatar__image-container',
								{ 'is-uploading': isUploading }
							)
						}
					>
						<Gravatar
							imgSize={ 400 }
							size={ 150 }
							user={ user }
						/>
						{ ! isUploading && this.renderInstructionText() }
						{ isUploading && <Spinner className="edit-gravatar__spinner" /> }
						</div>
				</FilePicker>
			</div>
		);
	}
}

export default connect(
	state => ( {
		user: getCurrentUser( state ),
		isUploading: isCurrentUserUploadingGravatar( state ),
	} ),
	{
		resetAllImageEditorState,
		receiveGravatarImageFailed,
		uploadGravatar
	}
)( localize( EditGravatar ) );
