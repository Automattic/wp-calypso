import { Button, CompactCard } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import PeopleProfile from 'calypso/my-sites/people/people-profile';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { didInviteDeletionSucceed } from 'calypso/state/invites/selectors';

import './style.scss';

class PeopleListItem extends PureComponent {
	static displayName = 'PeopleListItem';

	static propTypes = {
		site: PropTypes.object,
		invite: PropTypes.object,
		clickableItem: PropTypes.bool,
	};

	static defaultProps = {
		clickableItem: true,
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

	render() {
		const { className, invite, onRemove, siteId, translate, type, user, inviteWasDeleted } =
			this.props;

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
					<PeopleProfile
						invite={ invite }
						siteId={ siteId }
						type={ type }
						user={ user }
						showDate={ ! this.maybeGetCardLink() }
						showRole={ !! this.maybeGetCardLink() }
					/>
				</div>

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
			siteId,
			inviteKey,
			inviteWasDeleted,
		};
	},
	{ recordGoogleEvent }
)( localize( PeopleListItem ) );
