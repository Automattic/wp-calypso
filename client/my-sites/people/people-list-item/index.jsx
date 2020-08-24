/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, CompactCard } from '@automattic/components';
import PeopleProfile from 'my-sites/people/people-profile';
import config from 'config';
import {
	isRequestingInviteResend,
	didInviteResendSucceed,
	didInviteDeletionSucceed,
} from 'state/invites/selectors';
import { resendInvite } from 'state/invites/actions';
import { recordGoogleEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class PeopleListItem extends React.PureComponent {
	static displayName = 'PeopleListItem';

	static propTypes = {
		site: PropTypes.object,
		invite: PropTypes.object,
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
		const site = this.props.site,
			user = this.props.user;
		return (
			config.isEnabled( 'manage/edit-user' ) &&
			user &&
			user.roles &&
			site &&
			site.slug &&
			this.userHasPromoteCapability() &&
			! this.props.isSelectable
		);
	};

	maybeGetCardLink = () => {
		const { invite, site, type, user } = this.props;

		if ( 'invite-details' === type ) {
			return null;
		}

		const editLink = this.canLinkToProfile() && `/people/edit/${ site.slug }/${ user.login }`;
		const inviteLink = invite && `/people/invites/${ site.slug }/${ invite.key }`;

		return type === 'invite' ? inviteLink : editLink;
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

	renderInviteStatus = () => {
		const { type, invite, translate, requestingResend, resendSuccess } = this.props;
		const { isPending } = invite;
		const className = classNames( 'people-list-item__invite-status', {
			'is-pending': isPending,
			'is-invite-details': type === 'invite-details',
		} );
		const buttonClassName = classNames( 'people-list-item__invite-resend', {
			'is-success': resendSuccess,
		} );

		return (
			<div className={ className }>
				{ type === 'invite-details' &&
					( isPending ? (
						translate( 'Pending' )
					) : (
						<React.Fragment>
							<Gridicon icon="checkmark" size={ 18 } />
							{ translate( 'Accepted' ) }
						</React.Fragment>
					) ) }
				{ isPending && (
					<Button
						className={ buttonClassName }
						onClick={ this.onResend }
						busy={ requestingResend }
						compact
					>
						{ resendSuccess ? translate( 'Invite Sent!' ) : translate( 'Resend Invite' ) }
					</Button>
				) }
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
		} = this.props;

		const isInvite = invite && ( 'invite' === type || 'invite-details' === type );

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
			},
			className
		);
		const canLinkToProfile = this.canLinkToProfile();
		const tagName = canLinkToProfile ? 'a' : 'span';

		return (
			<CompactCard
				className={ classes }
				tagName={ tagName }
				href={ this.maybeGetCardLink() }
				onClick={ canLinkToProfile && this.navigateToUser }
			>
				<div className="people-list-item__profile-container">
					<PeopleProfile invite={ invite } siteId={ siteId } type={ type } user={ user } />
				</div>

				{ isInvite && this.renderInviteStatus() }

				{ onRemove && (
					<div className="people-list-item__actions">
						<Button
							compact
							className="people-list-item__remove-button"
							onClick={ onRemove }
							data-e2e-remove-login={ get( user, 'login', '' ) }
						>
							<Gridicon icon="cross" />
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
			siteId,
			inviteKey,
			inviteWasDeleted,
		};
	},
	{ resendInvite, recordGoogleEvent }
)( localize( PeopleListItem ) );
