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
import {
	recordTracksEvent,
	recordGoogleEvent,
	composeAnalytics,
} from 'calypso/state/analytics/actions';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { receiveGravatarDetails } from 'calypso/state/gravatar-status/actions';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';

import './style.scss';

// use imgSize = 400 for caching
// it's the popular value for large Gravatars in Calypso
const GRAVATAR_IMG_SIZE = 400;

export class EditGravatar extends Component {
	state = {
		showEmailVerificationNotice: false,
	};

	static propTypes = {
		translate: PropTypes.func,
		user: PropTypes.object,
		recordClickButtonEvent: PropTypes.func,
		recordAvatarUpdatedEvent: PropTypes.func,
		receiveGravatarDetails: PropTypes.func,
		onAvatarUpdated: PropTypes.func,
	};

	quickEditor = null;

	componentDidMount() {
		const {
			user,
			setCurrentUser: setUser,
			recordAvatarUpdatedEvent,
			receiveGravatarDetails: updateGravatarDetails,
		} = this.props;

		this.quickEditor = new GravatarQuickEditorCore( {
			email: user.email,
			scope: [ 'avatars' ],
			utm: 'wpcomme',
			onProfileUpdated: () => {
				recordAvatarUpdatedEvent();
				// Update the avatar URL to force a refresh.
				setUser( { ...user, avatar_URL: addQueryArgs( user.avatar_URL, { ver: Date.now() } ) } );
				// Update Gravatar details
				updateGravatarDetails( { has_gravatar: true } );
				// Let consumers (e.g. the Reader profile settings) react to the avatar change,
				// for instance to refresh data that reads the avatar from a different source.
				this.props.onAvatarUpdated?.();
			},
		} );

		// Close the quick editor on any pagehide event (refresh, tab close, or navigation away).
		window.addEventListener( 'pagehide', this.maybeCloseQuickEditor );
	}

	componentWillUnmount() {
		// Close the quick editor when the component unmounts (e.g. client-side nav).
		this.maybeCloseQuickEditor();
		window.removeEventListener( 'pagehide', this.maybeCloseQuickEditor );
	}

	maybeCloseQuickEditor = () => {
		if ( this.quickEditor?.isOpen() === true ) {
			this.quickEditor.close();
		}
	};

	renderEditGravatarIsLoading = () => {
		return (
			<div className="edit-gravatar">
				<div className="edit-gravatar__image-container">
					<div className="edit-gravatar__avatar-placeholder" />
				</div>
				<div className="edit-gravatar__explanation-container">
					<div className="edit-gravatar__action-button-placeholder" />
				</div>
			</div>
		);
	};

	render() {
		const { translate, user, recordClickButtonEvent } = this.props;

		if ( this.props.isFetchingUserSettings ) {
			return this.renderEditGravatarIsLoading();
		}

		return (
			<div
				className={ clsx( 'edit-gravatar', {
					'edit-gravatar--is-unverified': ! user.email_verified,
				} ) }
			>
				{ this.state.showEmailVerificationNotice && (
					<VerifyEmailDialog
						onClose={ () => this.setState( { showEmailVerificationNotice: false } ) }
					/>
				) }
				<div className="edit-gravatar__image-container">
					<Gravatar imgSize={ GRAVATAR_IMG_SIZE } size={ 150 } user={ user } />
					{ ! user.email_verified && (
						<div className="edit-gravatar__caution-icon" data-testid="caution-icon">
							<Icon icon={ caution } fill="#fff" size={ 24 } />
						</div>
					) }
				</div>
				<div className="edit-gravatar__explanation-container">
					{ user.email_verified ? (
						<Button
							className="edit-gravatar__action-button"
							variant="link"
							onClick={ () => {
								recordClickButtonEvent( { isVerified: user.email_verified } );
								this.maybeCloseQuickEditor(); // Ensure the quick editor is closed before opening it again.
								this.quickEditor?.open();
							} }
						>
							{ translate( 'Edit your avatar' ) }
						</Button>
					) : (
						<Button
							className="edit-gravatar__action-button"
							variant="link"
							onClick={ () => {
								this.props.recordClickButtonEvent( { isVerified: user.email_verified } );
								this.setState( { showEmailVerificationNotice: true } );
							} }
						>
							{ translate( 'Verify your email to edit your avatar' ) }
						</Button>
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

const recordAvatarUpdatedEvent = () => recordTracksEvent( 'calypso_edit_gravatar_update_success' );

export default connect(
	( state ) => ( {
		user: getCurrentUser( state ) || {},
		isFetchingUserSettings: isFetchingUserSettings( state ),
	} ),
	{
		setCurrentUser,
		recordClickButtonEvent,
		recordAvatarUpdatedEvent,
		receiveGravatarDetails,
	}
)( localize( EditGravatar ) );
