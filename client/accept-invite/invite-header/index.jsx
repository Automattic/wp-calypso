/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Site from 'my-sites/site';
import SitePlaceholder from 'my-sites/site/placeholder';
import Gravatar from 'components/gravatar';

export default React.createClass( {
	displayName: 'InviteHeader',

	getInvitationVerb() {
		switch ( get( this.props, 'invite.meta' ) ) {
			case 'viewer':
			case 'follower':
				return this.translate( 'view' );
				break;
			default:
				return this.translate( 'contribute to' );
		}
	},

	render() {
		let classes = classNames( 'invite-header', { 'is-placeholder': ! this.props.invite } );
		return(
			<div className={ classes }>
				<CompactCard className="invite-header__inviter">
					<div className="invite-header__inviter-info">
						<Gravatar user={ this.props.inviter } size={ 32 } />
						<p className="invite-header__invited-you-text">
							{
								this.translate( '{{strong}}%(user)s{{/strong}} invited you to %(verb)s:', {
									args: {
										user: get(
											this.props,
											'inviter.name',
											this.translate( 'User', { context: 'Placeholder text while loading an invitation.' } )
										),
										verb: this.getInvitationVerb()
									},
									components: {
										strong: <strong />
									}
								} )
							}
						</p>
					</div>
				</CompactCard>
				<CompactCard className="invite-header__site">
					{
						this.props.blog_details
						? <Site site={ this.props.blog_details } />
						: <SitePlaceholder />
					}
				</CompactCard>
			</div>
		);
	}
} );
