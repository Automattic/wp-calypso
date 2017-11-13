/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Site from 'blocks/site';
import SitePlaceholder from 'blocks/site/placeholder';
import Gravatar from 'components/gravatar';

class InviteHeader extends React.Component {
	static displayName = 'InviteHeader';

	getInviterName = () => {
		return get(
			this.props,
			'inviter.name',
			this.props.translate( 'User', { context: 'Placeholder text while loading an invitation.' } )
		);
	};

	getInvitedYouText = () => {
		let text = '';

		const inviterName = (
			<strong className="invite-header__inviter-name">{ this.getInviterName() }</strong>
		);

		const { role } = this.props;

		switch ( role ) {
			case 'administrator':
				text = this.props.translate( '{{inviterName/}} invited you to be an administrator on:', {
					components: {
						inviterName: inviterName,
					},
				} );
				break;
			case 'editor':
				text = this.props.translate( '{{inviterName/}} invited you to be an editor on:', {
					components: {
						inviterName: inviterName,
					},
				} );
				break;
			case 'author':
				text = this.props.translate( '{{inviterName/}} invited you to be an author on:', {
					components: {
						inviterName: inviterName,
					},
				} );
				break;
			case 'contributor':
				text = this.props.translate( '{{inviterName/}} invited you to be a contributor on:', {
					components: {
						inviterName: inviterName,
					},
				} );
				break;
			case 'subscriber':
				text = this.props.translate( '{{inviterName/}} invited you to subscribe to:', {
					components: {
						inviterName: inviterName,
					},
				} );
				break;
			case 'viewer':
				text = this.props.translate( '{{inviterName/}} invited you to view:', {
					components: {
						inviterName: inviterName,
					},
				} );
				break;
			case 'follower':
				text = this.props.translate( '{{inviterName/}} invited you to follow:', {
					components: {
						inviterName: inviterName,
					},
				} );
				break;
			default:
				text = this.props.translate( '{{inviterName/}} invited you to be %(invitedRole)s on:', {
					args: {
						invitedRole: role,
					},
					components: {
						inviterName: inviterName,
					},
				} );
				break;
		}

		return text;
	};

	render() {
		let classes = classNames( 'invite-header', { 'is-placeholder': ! this.props.inviteKey } );

		return (
			<div className={ classes }>
				<CompactCard className="invite-header__inviter">
					<div className="invite-header__inviter-info">
						<Gravatar user={ this.props.inviter } size={ 32 } />
						<p className="invite-header__invited-you-text">{ this.getInvitedYouText() }</p>
					</div>
				</CompactCard>
				<CompactCard className="invite-header__site">
					{ this.props.site ? <Site site={ this.props.site } /> : <SitePlaceholder /> }
				</CompactCard>
			</div>
		);
	}
}

export default localize( InviteHeader );
