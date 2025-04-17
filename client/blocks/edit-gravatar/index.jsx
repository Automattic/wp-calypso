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
import { setCurrentUser } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';

import './style.scss';

export class EditGravatar extends Component {
	state = {
		showEmailVerificationNotice: false,
	};

	static propTypes = {
		translate: PropTypes.func,
		user: PropTypes.object,
		recordClickButtonEvent: PropTypes.func,
		recordAvatarUpdateEvent: PropTypes.func,
	};

	quickEditor = null;

	componentDidMount() {
		const { user, setCurrentUser: setUser, recordAvatarUpdateEvent } = this.props;

		this.quickEditor = new GravatarQuickEditorCore( {
			email: user.email,
			scope: [ 'avatars' ],
			onProfileUpdated: () => {
				recordAvatarUpdateEvent();
				// Update the avatar URL to force a refresh.
				setUser( { ...user, avatar_URL: addQueryArgs( user.avatar_URL, { ver: Date.now() } ) } );
			},
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
			<div className="edit-gravatar">
				<div className="edit-gravatar__image-container">
					<div className="edit-gravatar__gravatar-placeholder" />
				</div>
				<div className="edit-gravatar__explanation-container">
					<div className="edit-gravatar__edit-button-placeholder" />
				</div>
			</div>
		);
	};

	renderGravatarProfileHidden = () => {
		return (
			<div className="edit-gravatar">
				<div className="edit-gravatar__image-container">
					<div className="edit-gravatar__gravatar-is-hidden">
						<Gridicon
							icon="user"
							size={ 96 } /* eslint-disable-line wpcalypso/jsx-gridicon-size */
						/>
					</div>
				</div>
				<div className="edit-gravatar__explanation-container">
					<p className="edit-gravatar__explanation">
						{ this.props.translate( 'Your avatar is hidden.' ) }
					</p>
					<InfoPopover className="edit-gravatar__pop-over" position="left">
						{ this.props.translate(
							'{{p}}The avatar you use on WordPress.com comes ' +
								'from {{ExternalLink}}Gravatar{{/ExternalLink}}, a universal avatar service ' +
								'(it stands for "Globally Recognized Avatar," get it?).{{/p}}' +
								'{{p}}However, because your Gravatar is currently disabled, ' +
								'both your avatar and Gravatar profile are hidden and won’t appear on any site.{{/p}}',
							{
								components: {
									ExternalLink: <ExternalLink href="https://gravatar.com" target="_blank" icon />,
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
		// use imgSize = 400 for caching
		// it's the popular value for large Gravatars in Calypso
		const GRAVATAR_IMG_SIZE = 400;

		if ( this.props.isFetchingUserSettings ) {
			return this.renderEditGravatarIsLoading();
		}

		if ( isGravatarProfileHidden ) {
			return this.renderGravatarProfileHidden();
		}

		return (
			<div
				className={ clsx( 'edit-gravatar', {
					'edit-gravatar--is-unverified': ! user.email_verified,
				} ) }
			>
				{ this.state.showEmailVerificationNotice && (
					<VerifyEmailDialog onClose={ this.closeVerifyEmailDialog } />
				) }
				<div className="edit-gravatar__image-container">
					<Gravatar imgSize={ GRAVATAR_IMG_SIZE } size={ 150 } user={ user } />
					{ ! user.email_verified && (
						<div className="edit-gravatar__caution-icon">
							<Icon icon={ caution } fill="#fff" size={ 24 } />
						</div>
					) }
				</div>
				<div className="edit-gravatar__explanation-container">
					{ user.email_verified ? (
						<Button
							className="edit-gravatar__edit-button"
							variant="link"
							onClick={ () => {
								recordClickButtonEvent( { isVerified: user.email_verified } );
								this.quickEditor?.open();
							} }
						>
							{ translate( 'Edit your public avatar' ) }
						</Button>
					) : (
						<p className="edit-gravatar__explanation">
							{ translate( 'Verify your email to edit your avatar.' ) }
						</p>
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

const recordAvatarUpdateEvent = () => recordTracksEvent( 'calypso_edit_gravatar_update_success' );

export default connect(
	( state ) => ( {
		user: getCurrentUser( state ) || {},
		isFetchingUserSettings: isFetchingUserSettings( state ),
		isGravatarProfileHidden: getUserSetting( state, 'gravatar_profile_hidden' ),
	} ),
	{
		setCurrentUser,
		recordClickButtonEvent,
		recordAvatarUpdateEvent,
	}
)( localize( EditGravatar ) );
