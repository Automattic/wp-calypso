import { Button, CompactCard } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import PeopleProfile from 'calypso/my-sites/people/people-profile';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { sendInvites, resendInvite } from 'calypso/state/invites/actions';
import {
	isRequestingInviteResend,
	didInviteResendSucceed,
	didInviteDeletionSucceed,
	getSendInviteState,
} from 'calypso/state/invites/selectors';

import './style.scss';

class PeopleListItem extends PureComponent {
	static displayName = 'PeopleListItem';

	static propTypes = {
		site: PropTypes.object,
		invite: PropTypes.object,
		showStatus: PropTypes.bool,
		clickableItem: PropTypes.bool,
		RevokeClearBtn: PropTypes.elementType,
	};

	static defaultProps = {
		clickableItem: true,
		RevokeClearBtn: null,
	};

	navigateToUser = () => {
		window.scrollTo( 0, 0 );
		this.props.recordGoogleEvent( 'People', 'Clicked User Profile From Team List' );
	};

	userHasPromoteCapability = () => {
		const site = this.props.site;
		return site && site.capabilities && site.capabilities.promote_users;
	};

	canLinkToProfile = () => {
		const site = this.props.site;
		const user = this.props.user;
		return (
			user &&
			user.roles &&
			site &&
			site.slug &&
			this.userHasPromoteCapability() &&
			! this.props.isSelectable
		);
	};

	canReceiveInvite = () => {
		const site = this.props.site;
		const user = this.props.user;
		return (
			user &&
			user.roles &&
			user.email &&
			! user.linked_user_ID &&
			site &&
			site.slug &&
			! this.props.isSelectable
		);
	};

	canLinkToSubscriberProfile = () => {
		const { site, user } = this.props;

		return site && site.slug && user && user.ID;
	};

	maybeGetCardLink = () => {
		const { invite, site, type, user, clickableItem } = this.props;

		if ( ! clickableItem ) {
			return false;
		}

		switch ( type ) {
			case 'invite-details':
				return null;

			case 'invite':
				return invite && `/people/invites/${ site.slug }/${ invite.key }`;

			case 'subscriber-details': {
				const subscriberType = user.login ? 'wpcom' : 'email';

				return (
					this.canLinkToSubscriberProfile() &&
					`/people/subscribers/${ site.slug }/${ subscriberType }-${ user.ID }`
				);
			}

			case 'viewer':
				return `/people/viewers/${ site.slug }/${ user.ID }`;

			default:
				return this.canLinkToProfile() && `/people/edit/${ site.slug }/${ user.login }`;
		}
	};

	onResend = ( event ) => {
		const { requestingResend, resendSuccess, siteId, inviteKey } = this.props;

		// Prevents navigation to invite-details screen and onClick event.
		event.preventDefault();
		event.stopPropagation();

		if ( requestingResend || resendSuccess ) {
			return null;
		}

		this.props.resendInvite( siteId, inviteKey );
	};

	onSendInvite = ( event ) => {
		const { requestingSend, siteId, user } = this.props;
		// Prevents navigation to invite-details screen and onClick event.
		event.preventDefault();
		event.stopPropagation();

		if ( requestingSend?.progress ) {
			return null;
		}

		this.props.sendInvites( siteId, [ user.email ], user.roles[ 0 ], '', false );
	};

	renderInviteStatus = () => {
		const { type, invite, translate, requestingResend, resendSuccess, RevokeClearBtn } = this.props;
		const { isPending } = invite;
		const className = classNames( 'people-list-item__invite-status', {
			'is-pending': isPending,
			'is-invite-details': type === 'invite-details',
		} );
		const btnResendClassName = classNames( 'people-list-item__invite-resend', {
			'is-success': resendSuccess,
		} );
		const btnRevokeClassName = classNames( 'people-list-item__invite-revoke' );

		return (
			<div className={ className }>
				{ isPending && (
					<Button
						className={ btnResendClassName }
						onClick={ this.onResend }
						busy={ requestingResend }
					>
						{ resendSuccess ? translate( 'Invite Sent!' ) : translate( 'Resend Invite' ) }
					</Button>
				) }

				<RevokeClearBtn className={ btnRevokeClassName } />
			</div>
		);
	};

	renderInviteButton = () => {
		const { translate, requestingSend } = this.props;

		return (
			<div className="people-list-item__invite-status">
				<Button
					busy={ requestingSend?.progress }
					className="people-list-item__invite-send"
					onClick={ this.onSendInvite }
				>
					{ translate( 'Invite' ) }
				</Button>
			</div>
		);
	};

	render() {
		const {
			className,
			invite,
			onRemove,
			siteId,
			translate,
			type,
			user,
			inviteWasDeleted,
			showStatus,
		} = this.props;

		const isInvite = invite && ( 'invite' === type || 'invite-details' === type );
		const isLinkedUser = user && user.linked_user_ID;

		if ( isInvite && inviteWasDeleted ) {
			// After an invite is deleted and the user is returned to the
			// invites list, the invite can occasionally reappear in the next
			// API call, so we need to check for this situation and avoid
			// rendering an invite that we know is actually deleted.
			return null;
		}

		const classes = classNames(
			'people-list-item',
			{
				'is-invite': isInvite,
				'is-invite-details': type === 'invite-details',
				'is-not-linked-user': ! isLinkedUser && ! isInvite,
			},
			className
		);
		const canLinkToProfile = this.canLinkToProfile();
		const canReceiveInvite = this.canReceiveInvite();
		const tagName = canLinkToProfile ? 'a' : 'span';

		return (
			<CompactCard
				className={ classes }
				tagName={ tagName }
				href={ this.maybeGetCardLink() }
				onClick={ canLinkToProfile && this.navigateToUser }
			>
				<div className="people-list-item__profile-container">
					<PeopleProfile
						invite={ invite }
						siteId={ siteId }
						type={ type }
						user={ user }
						showDate={ ! this.maybeGetCardLink() }
						showRole={ !! this.maybeGetCardLink() }
					/>
				</div>

				{ canReceiveInvite && ! isInvite && this.renderInviteButton() }
				{ isInvite && showStatus && this.renderInviteStatus() }

				{ onRemove && (
					<div className="people-list-item__actions">
						<Button
							className="people-list-item__remove-button"
							onClick={ onRemove }
							data-e2e-remove-login={ get( user, 'login', '' ) }
						>
							<span>
								{ translate( 'Remove', {
									context: 'Verb: Remove a user or follower from the blog.',
								} ) }
							</span>
						</Button>
					</div>
				) }
			</CompactCard>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const { site, invite } = ownProps;

		const siteId = site && site.ID;
		const inviteKey = invite && invite.key;
		const inviteWasDeleted = inviteKey && didInviteDeletionSucceed( state, siteId, inviteKey );

		return {
			requestingResend: isRequestingInviteResend( state, siteId, inviteKey ),
			resendSuccess: didInviteResendSucceed( state, siteId, inviteKey ),
			requestingSend: getSendInviteState( state ),
			siteId,
			inviteKey,
			inviteWasDeleted,
		};
	},
	{ sendInvites, resendInvite, recordGoogleEvent }
)( localize( PeopleListItem ) );
