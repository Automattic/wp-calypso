/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
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

class PeopleListItem extends React.PureComponent {
	static displayName = 'PeopleListItem';

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

	getCardLink = () => {
		const { invite, site, type, user } = this.props;
		const editLink = this.canLinkToProfile() && `/people/edit/${ site.slug }/${ user.login }`;
		const inviteLink = invite && `/people/invites/${ site.slug }/${ invite.key }`;

		return type === 'invite' ? inviteLink : editLink;
	};

	renderInviteStatus = () => {
		const { invite, translate } = this.props;
		const { isPending } = invite;
		const statusClasses = {
			'is-pending': isPending,
		};
		const className = classNames( 'people-list-item__invite-status', statusClasses );

		return (
			<div className={ className }>
				{ ! isPending && <Gridicon icon="checkmark" size={ 18 } /> }
				{ isPending ? translate( 'Pending' ) : translate( 'Accepted' ) }
				{ isPending && (
					<Button className="people-list-item__invite-resend" compact>
						{ translate( 'Resend Invite' ) }
					</Button>
				) }
			</div>
		);
	};

	render() {
		const { className, invite, onRemove, translate, type, user } = this.props;
		const canLinkToProfile = this.canLinkToProfile();
		const tagName = canLinkToProfile ? 'a' : 'span';
		const isInvite = invite && 'invite' === type;

		return (
			<CompactCard
				className={ classNames( 'people-list-item', className ) }
				tagName={ tagName }
				href={ this.getCardLink() }
				onClick={ canLinkToProfile && this.navigateToUser }
			>
				<div className="people-list-item__profile-container">
					<PeopleProfile invite={ invite } type={ type } user={ user } />
				</div>

				{ isInvite && this.renderInviteStatus() }

				{ onRemove && (
					<div className="people-list-item__actions">
						<button className="button is-link people-list-item__remove-button" onClick={ onRemove }>
							{ translate( 'Remove', {
								context: 'Verb: Remove a user or follower from the blog.',
							} ) }
						</button>
					</div>
				) }
			</CompactCard>
		);
	}
}

export default localize( PeopleListItem );
