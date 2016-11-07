/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FilePicker from 'components/file-picker';
import FormLabel from 'components/forms/form-label';
import { getCurrentUser } from 'state/current-user/selectors';
import { getToken as getOauthToken } from 'lib/oauth-token';
import Gravatar from 'components/gravatar';
import {
	isCurrentUserUploadingGravatar,
} from 'state/current-user/gravatar-status/selectors';
import { isOffline } from 'state/application/selectors';
import Spinner from 'components/spinner';
import { uploadGravatar } from 'state/current-user/gravatar-status/actions';

/**
 * Module dependencies
 */
const debug = debugFactory( 'calypso:edit-gravatar' );

export class EditGravatar extends Component {
	static propTypes = {
		isOffline: PropTypes.bool,
		isUploading: PropTypes.bool,
		translate: PropTypes.func,
		uploadGravatar: PropTypes.func,
		user: PropTypes.object,
	};

	handleOnPick = ( files ) => {
		const { uploadGravatar: uploadGravatarAction, user } = this.props;
		debug( 'you picked', files[ 0 ].name );

		// check for bearerToken from desktop app
		let bearerToken = getOauthToken();

		if ( ! bearerToken ) {
			bearerToken = localStorage.getItem( 'bearerToken' );
		}

		// send gravatar request
		if ( bearerToken ) {
			debug( 'Got the bearerToken, sending request' );
			uploadGravatarAction( files[ 0 ], bearerToken, user.email );
		} else {
			debug( 'Oops - no bearer token.' );
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
				<FilePicker accept="image/*" onPick={ this.handleOnPick }>
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
	{ uploadGravatar }
)( localize( EditGravatar ) );
