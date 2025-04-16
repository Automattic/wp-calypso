import { Gridicon, ExternalLink } from '@automattic/components';
import { GravatarQuickEditorCore } from '@gravatar-com/quick-editor';
import { Icon, Button } from '@wordpress/components';
import { caution } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import VerifyEmailDialog from 'calypso/components/email-verification/email-verification-dialog';
import Gravatar from 'calypso/components/gravatar';
import InfoPopover from 'calypso/components/info-popover';
import {
	recordTracksEvent,
	recordGoogleEvent,
	composeAnalytics,
} from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { resetAllImageEditorState } from 'calypso/state/editor/image-editor/actions';
import { receiveGravatarImageFailed, uploadGravatar } from 'calypso/state/gravatar-status/actions';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';

import './style.scss';

export class EditGravatar extends Component {
	state = {
		isEditingImage: false,
		image: false,
		showEmailVerificationNotice: false,
		avatarUrlCacheVer: '',
	};

	static propTypes = {
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
			<div className="edit-gravatar edit-gravatar--is-loading">
				<div className="edit-gravatar__avatar-container">
					<div className="edit-gravatar__gravatar-placeholder" />
				</div>
				<div>
					<p className="edit-gravatar__explanation edit-gravatar__explanation-placeholder" />
				</div>
			</div>
		);
	};

	renderGravatarProfileHidden = ( { gravatarLink, translate } ) => {
		return (
			<div className="edit-gravatar edit-gravatar--is-hidden">
				<div className="edit-gravatar__avatar-container">
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
					<p className="edit-gravatar__explanation">{ translate( 'Your avatar is hidden.' ) }</p>
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
		const { isGravatarProfileHidden, translate, user, recordClickButtonEvent } = this.props;
		const gravatarLink = 'https://gravatar.com';
		// use imgSize = 400 for caching
		// it's the popular value for large Gravatars in Calypso
		const GRAVATAR_IMG_SIZE = 400;

		if ( this.props.isFetchingUserSettings ) {
			return this.renderEditGravatarIsLoading();
		}

		if ( isGravatarProfileHidden ) {
			return this.renderGravatarProfileHidden( { gravatarLink, translate } );
		}

		const avatarUrl = addQueryArgs( user.avatar_URL, { ver: this.state.avatarUrlCacheVer } );

		return (
			<div
				className={ clsx( 'edit-gravatar', {
					'edit-gravatar--is-unverified': ! user.email_verified,
				} ) }
			>
				{ this.state.showEmailVerificationNotice && (
					<VerifyEmailDialog onClose={ this.closeVerifyEmailDialog } />
				) }
				<div className="edit-gravatar__avatar-container">
					<Gravatar
						imgSize={ GRAVATAR_IMG_SIZE }
						size={ 150 }
						user={ { ...user, avatar_URL: avatarUrl } }
					/>
					{ ! user.email_verified && (
						<div className="edit-gravatar__caution-icon">
							<Icon icon={ caution } fill="#fff" size={ 24 } />
						</div>
					) }
				</div>
				<Button
					className="edit-gravatar__edit-avatar-button"
					variant="link"
					onClick={ () => {
						recordClickButtonEvent( { isVerified: user.email_verified } );
						this.quickEditor?.open();
					} }
					disabled={ ! user.email_verified }
				>
					{ translate( 'Edit your public avatar' ) }
				</Button>
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
	} ),
	{
		resetAllImageEditorState,
		receiveGravatarImageFailed,
		uploadGravatar,
		recordClickButtonEvent,
		recordReceiveImageEvent,
	}
)( localize( EditGravatar ) );
