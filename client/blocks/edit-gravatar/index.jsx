import { Gridicon, ExternalLink } from '@automattic/components';
import { GravatarQuickEditorCore } from '@gravatar-com/quick-editor';
import { Spinner } from '@wordpress/components';
import { Icon, upload, caution } from '@wordpress/icons';
import clsx from 'clsx';
import { localize, translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import VerifyEmailDialog from 'calypso/components/email-verification/email-verification-dialog';
import Gravatar from 'calypso/components/gravatar';
import InfoPopover from 'calypso/components/info-popover';
import { addQueryArgs } from 'calypso/lib/url';
import {} from 'calypso/state/action-types';
import {
	recordTracksEvent,
	recordGoogleEvent,
	composeAnalytics,
} from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import './style.scss';

const GRAVATAR_IMG_SIZE = 400;
const GRAVATAR_SELECTOR = '.gravatar,.masterbar__item-howdy-gravatar';
export class EditGravatar extends Component {
	state = {
		showEmailVerificationNotice: false,
	};

	static propTypes = {
		translate: PropTypes.func,
		user: PropTypes.object,
		recordClickButtonEvent: PropTypes.func,
		onProfileUpdated: PropTypes.func,
		onOpened: PropTypes.func,
		onClosed: PropTypes.func,
	};

	handleAvatarClick = () => {
		const { user, recordClickButtonEvent, onProfileUpdated, onOpened, onClosed } = this.props;
		recordClickButtonEvent( { isVerified: this.props.user.email_verified } );

		if ( user.email_verified ) {
			const quickEditor = new GravatarQuickEditorCore( {
				email: user.email,
				onProfileUpdated,
				onOpened,
				onClosed,
				scope: [ 'avatars' ],
			} );
			quickEditor.open();
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

	renderGravatarProfileHidden = ( { gravatarLink } ) => {
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
		const { isGravatarProfileHidden, isUploading, user } = this.props;
		const gravatarLink = 'https://gravatar.com';
		// use imgSize = 400 for caching
		// it's the popular value for large Gravatars in Calypso
		const uploadButtonLabel = user.email_verified
			? translate( 'Change profile photo' )
			: translate( 'Verify your email to change profile photo' );

		if ( this.props.isFetchingUserSettings ) {
			return this.renderEditGravatarIsLoading();
		}

		if ( isGravatarProfileHidden ) {
			return this.renderGravatarProfileHidden( { gravatarLink, translate } );
		}

		return (
			<div
				className={ clsx(
					'edit-gravatar',
					{ 'is-unverified': ! user.email_verified },
					{ 'is-uploading': isUploading }
				) }
			>
				<button
					type="button"
					onClick={ this.handleAvatarClick }
					className="edit-gravatar__image-button"
					id="gravatar-avatar-edit-button"
					aria-label={ uploadButtonLabel }
				>
					<div
						data-tip-target="edit-gravatar"
						className={ clsx( 'edit-gravatar__image-container', {
							'is-uploading': isUploading,
						} ) }
					>
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
				{ this.state.showEmailVerificationNotice && (
					<VerifyEmailDialog onClose={ this.closeVerifyEmailDialog } />
				) }
				<div>
					<p className="edit-gravatar__explanation">
						{ translate( 'Your profile photo is public.' ) }
					</p>
					<InfoPopover className="edit-gravatar__pop-over" position="left">
						{ translate(
							'{{p}}This avatar is managed by {{ExternalLink}}Gravatar{{/ExternalLink}}.' +
								' If you do not have a Gravatar account, one will be created for you when you upload your first image.{{/p}}',
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
	}
}

const recordClickButtonEvent = ( { isVerified } ) =>
	composeAnalytics(
		recordTracksEvent( 'calypso_edit_gravatar_click', { user_verified: isVerified } ),
		recordGoogleEvent( 'Me', 'Clicked on Edit Gravatar Button in Profile' )
	);

export default connect(
	( state ) => ( {
		user: getCurrentUser( state ) || {},
		isFetchingUserSettings: isFetchingUserSettings( state ),
		isGravatarProfileHidden: getUserSetting( state, 'gravatar_profile_hidden' ),
	} ),
	{
		recordClickButtonEvent,
		onProfileUpdated() {
			return ( dispatch ) => {
				dispatch( recordTracksEvent( 'calypso_edit_gravatar_upload_success' ) );
				dispatch(
					successNotice(
						translate( 'You successfully uploaded a new profile photo — looking sharp!' ),
						{
							id: 'gravatar-upload',
						}
					)
				);
				// Update the Gravatar images to bust the cache
				document
					.querySelectorAll( GRAVATAR_SELECTOR )
					.forEach( ( el ) => ( el.src = addQueryArgs( { cache: Date.now() }, el.src ) ) );
			};
		},
		onOpened() {
			return recordTracksEvent( 'calypso_edit_gravatar_quick_editor_opened' );
		},
		onClosed() {
			return recordTracksEvent( 'calypso_edit_gravatar_quick_editor_closed' );
		},
	}
)( localize( EditGravatar ) );
