/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import PeopleProfile from 'my-sites/people/people-profile';
import analytics from 'lib/analytics';
import config from 'config';
import { isRequestingResend, didResendSucceed } from 'state/invites/selectors';
import { resendInvite } from 'state/invites/actions';

class PeopleListItem extends React.PureComponent {
	static displayName = 'PeopleListItem';

	static propTypes = {
		site: PropTypes.object,
		invite: PropTypes.object,
	};

	navigateToUser = () => {
		window.scrollTo( 0, 0 );
		analytics.ga.recordEvent( 'People', 'Clicked User Profile From Team List' );
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

	onResend = event => {
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
		const { className, invite, onRemove, translate, type, user } = this.props;

		const isInvite = invite && ( 'invite' === type || 'invite-details' === type );

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
					<PeopleProfile invite={ invite } type={ type } user={ user } />
				</div>

				{ isInvite && this.renderInviteStatus() }

				{ onRemove && (
					<div className="people-list-item__actions">
						<Button className="button is-link people-list-item__remove-button" onClick={ onRemove }>
							{ translate( 'Remove', {
								context: 'Verb: Remove a user or follower from the blog.',
							} ) }
						</Button>
					</div>
				) }
			</CompactCard>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = ownProps.site && ownProps.site.ID;
		const inviteKey = ownProps.invite && ownProps.invite.key;

		return {
			requestingResend: isRequestingResend( state, siteId, inviteKey ),
			resendSuccess: didResendSucceed( state, siteId, inviteKey ),
			siteId,
			inviteKey,
		};
	},
	{ resendInvite }
)( localize( PeopleListItem ) );
