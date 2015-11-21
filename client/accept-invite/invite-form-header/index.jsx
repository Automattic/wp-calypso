/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import userModule from 'lib/user';

/**
 * Module variables
 */
const user = userModule();

export default React.createClass( {
	displayName: 'InviteFormHeader',

	getRole() {
		return get( this.props, 'invite.meta.role' );
	},

	getSiteName() {
		return get( this.props, 'blog_details.title' );
	},

	getSiteDomain() {
		return get( this.props, 'blog_details.domain' );
	},

	getLoggedOutTitleForInvite() {
		let title = '';
		let siteLink = (
			<a href={ this.getSiteDomain() } className="invite-header__site-link" />
		);

		switch ( this.getRole() ) {
			case 'administrator':
				title = this.translate(
					'Sign up to become an administrator of {{siteLink}}%(siteName)s{{/siteLink}}.', {
						args: {
							siteName: this.getSiteName()
						},
						components: {
							siteLink: siteLink
						}
					}
				);
				break;
			case 'editor':
				title = this.translate(
					'Sign up to become an editor of {{siteLink}}%(siteName)s{{/siteLink}}.', {
						args: {
							siteName: this.getSiteName()
						},
						components: {
							siteLink: siteLink
						}
					}
				);
				break;
			case 'author':
				title = this.translate(
					'Sign up to become an author of {{siteLink}}%(siteName)s{{/siteLink}}.', {
						args: {
							siteName: this.getSiteName()
						},
						components: {
							siteLink: siteLink
						}
					}
				);
				break;
			case 'contributor':
				title = this.translate(
					'Sign up to become a contributor to {{siteLink}}%(siteName)s{{/siteLink}}.', {
						args: {
							siteName: this.getSiteName()
						},
						components: {
							siteLink: siteLink
						}
					}
				);
				break;
			case 'subscriber':
				title = this.translate(
					'Sign up to become a subscriber of {{siteLink}}%(siteName)s{{/siteLink}}.', {
						args: {
							siteName: this.getSiteName()
						},
						components: {
							siteLink: siteLink
						}
					}
				);
				break;
			case 'follower':
				title = this.translate(
					'Sign up to become a follower of {{siteLink}}%(siteName)s{{/siteLink}}.', {
						args: {
							siteName: this.getSiteName()
						},
						components: {
							siteLink: siteLink
						}
					}
				);
				break;
			default:
				title = this.translate(
					'Sign up to join {{siteLink}}%(siteName)s{{/siteLink}} with a role of: {{strong}}%(siteRole)s{{/strong}}.', {
						args: {
							siteName: this.getSiteName(),
							siteRole: this.getRole()
						},
						components: {
							siteLink: siteLink,
							strong: <strong />
						}
					}
				);
		}

		return title;
	},

	getLoggedInTitleForInvite() {
		let title = '';
		let siteLink = (
			<a href={ this.getSiteDomain() } className="invite-header__site-link" />
		);

		switch ( this.getRole() ) {
			case 'administrator':
				title = this.translate(
					'Would you like to become an administrator of {{siteLink}}%(siteName)s{{/siteLink}}?', {
						args: {
							siteName: this.getSiteName()
						},
						components: {
							siteLink: siteLink
						}
					}
				);
				break;
			case 'editor':
				title = this.translate(
					'Would you like to become an editor of {{siteLink}}%(siteName)s{{/siteLink}}?', {
						args: {
							siteName: this.getSiteName()
						},
						components: {
							siteLink: siteLink
						}
					}
				);
				break;
			case 'author':
				title = this.translate(
					'Would you like to become an author of {{siteLink}}%(siteName)s{{/siteLink}}?', {
						args: {
							siteName: this.getSiteName()
						},
						components: {
							siteLink: siteLink
						}
					}
				);
				break;
			case 'contributor':
				title = this.translate(
					'Would you like to become a contributor to {{siteLink}}%(siteName)s{{/siteLink}}?', {
						args: {
							siteName: this.getSiteName()
						},
						components: {
							siteLink: siteLink
						}
					}
				);
				break;
			case 'subscriber':
				title = this.translate(
					'Would you like to become a subscriber of {{siteLink}}%(siteName)s{{/siteLink}}?', {
						args: {
							siteName: this.getSiteName()
						},
						components: {
							siteLink: siteLink
						}
					}
				);
				break;
			case 'follower':
				title = this.translate(
					'Would you like to become a follower of {{siteLink}}%(siteName)s{{/siteLink}}?', {
						args: {
							siteName: this.getSiteName()
						},
						components: {
							siteLink: siteLink
						}
					}
				);
				break;
			default:
				title = this.translate(
					'Would you like to join {{siteLink}}%(siteName)s{{/siteLink}} with a role of: {{strong}}%(siteRole)s{{/strong}}?', {
						args: {
							siteRole: this.getRole()
						},
						components: {
							siteLink: siteLink,
							strong: <strong />
						}
					}
				);
		}

		return title;
	},

	getExplanationForInvite() {
		let explanation = '';
		switch ( this.getRole() ) {
			case 'administrator':
				explanation = this.translate(
					'As an administrator, you will be able to manage all aspects of %(siteName)s.', {
						args: {
							siteName: this.getSiteName()
						}
					}
				);
				break;
			case 'editor':
				explanation = this.translate(
					'As an editor, you will be able to publish and manage your own posts and the posts of others, as well as upload media.'
				);
				break;
			case 'author':
				explanation = this.translate(
					'As an author, you will be able to publish and edit your own posts as well as upload media.'
				);
				break;
			case 'contributor':
				explanation = this.translate(
					'As a contributor, you will be able to write and manage your own posts, but you will not be able to publish on your own.'
				);
				break;
			case 'subscriber':
				explanation = this.translate(
					'As a subscriber, you will be able to manage your profile on %(siteName)s', {
						args: {
							siteName: this.getSiteName()
						}
					}
				);
				break;
			case 'follower':
				explanation = this.translate(
					'As a follower, you will receive updates every time there is a new post on %(siteName)s', {
						args: {
							siteName: this.getSiteName()
						}
					}
				);
				break
		}

		return explanation;
	},

	render() {
		let roleExplanation = this.getExplanationForInvite();
		return (
			<div className="invite-form-header">
				<h3 className="invite-form-header__title">
					{ user.get() ? this.getLoggedInTitleForInvite() : this.getLoggedOutTitleForInvite() }
				</h3>
				{ roleExplanation &&
					<p className="invite-form-header__explanation">
						{ roleExplanation }
					</p>
				}
			</div>
		)
	}
} );
