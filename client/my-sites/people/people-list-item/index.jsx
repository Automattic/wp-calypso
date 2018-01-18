/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
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
		const inviteLink = invite && `/people/invites/${ site.slug }/${ invite.invite_key }`;

		return type === 'invite' ? inviteLink : editLink;
	};

	render() {
		const { className, gravatarUser, invite, onRemove, translate, type, user } = this.props;
		const canLinkToProfile = this.canLinkToProfile();
		const tagName = canLinkToProfile ? 'a' : 'span';

		return (
			<CompactCard
				{ ...omit(
					this.props,
					'className',
					'gravatarUser',
					'invite',
					'user',
					'site',
					'isSelectable',
					'onRemove',
					'moment',
					'numberFormat',
					'translate',
					'type'
				) }
				className={ classNames( 'people-list-item', className ) }
				tagName={ tagName }
				href={ this.getCardLink() }
				onClick={ canLinkToProfile && this.navigateToUser }
			>
				<div className="people-list-item__profile-container">
					<PeopleProfile
						invite={ invite }
						gravatarUser={ gravatarUser }
						type={ type }
						user={ user }
					/>
				</div>
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
