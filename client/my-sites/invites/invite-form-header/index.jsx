/**
 * External dependencies
 *
 * @format
 */

import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

export default React.createClass( {
	displayName: 'InviteFormHeader',

	clickedSiteLink() {
		analytics.tracks.recordEvent( 'calypso_invite_accept_form_header_site_link_click' );
	},

	getSiteLink() {
		const { site } = this.props;

		if ( ! site ) {
			return null;
		}

		return (
			<a href={ site.URL } onClick={ this.clickedSiteLink } className="invite-header__site-link">
				{ site.title }
			</a>
		);
	},

	getSiteName() {
		const { site } = this.props;

		return site.title || '';
	},

	getLoggedOutTitleForInvite() {
		let title = '';
		const { role, forceMatchingEmail, knownUser } = this.props;

		if ( forceMatchingEmail && knownUser ) {
			return this.translate( 'Sign in to continue:' );
		}

		switch ( role ) {
			case 'administrator':
				title = this.translate( 'Sign up to start managing {{siteLink/}}.', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			case 'editor':
				title = this.translate( 'Sign up to start editing {{siteLink/}}.', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			case 'author':
				title = this.translate( 'Sign up to start writing for {{siteLink/}}.', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			case 'contributor':
				title = this.translate( 'Sign up to start contributing to {{siteLink/}}.', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			case 'subscriber':
				title = this.translate( 'Sign up to start your subscription to {{siteLink/}}.', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			case 'viewer':
				title = this.translate( 'Sign up to begin viewing {{siteLink/}}.', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			case 'follower':
				title = this.translate(
					'Sign up to start following {{siteLink/}} in the WordPress.com Reader.',
					{
						components: {
							siteLink: this.getSiteLink(),
						},
					}
				);
				break;
			default:
				title = this.translate(
					'Sign up to join {{siteLink/}} as: {{strong}}%(siteRole)s{{/strong}}.',
					{
						args: {
							siteRole: role,
						},
						components: {
							siteLink: this.getSiteLink(),
							strong: <strong />,
						},
					}
				);
		}

		return title;
	},

	getLoggedInTitleForInvite() {
		let title = '';

		const { role } = this.props;

		switch ( role ) {
			case 'administrator':
				title = this.translate( 'Would you like to start managing {{siteLink/}}?', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			case 'editor':
				title = this.translate( 'Would you like to start editing {{siteLink/}}?', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			case 'author':
				title = this.translate( 'Would you like to start writing for {{siteLink/}}?', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			case 'contributor':
				title = this.translate( 'Would you like to start contributing to {{siteLink/}}?', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			case 'subscriber':
				title = this.translate(
					'Would you like to start following {{siteLink/}} in the WordPress.com Reader?',
					{
						components: {
							siteLink: this.getSiteLink(),
						},
					}
				);
				break;
			case 'viewer':
				title = this.translate( 'Would you like to be able to view {{siteLink/}}?', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			case 'follower':
				title = this.translate( 'Would you like to become a follower of {{siteLink/}}?', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			default:
				title = this.translate(
					'Would you like to join {{siteLink/}} as: {{strong}}%(siteRole)s{{/strong}}?',
					{
						args: {
							siteRole: role,
						},
						components: {
							siteLink: this.getSiteLink(),
							strong: <strong />,
						},
					}
				);
		}

		return title;
	},

	getExplanationForInvite() {
		let explanation = '';

		switch ( this.props.role ) {
			case 'administrator':
				explanation = this.translate(
					'As an administrator, you will be able to manage all aspects of %(siteName)s.',
					{
						args: {
							siteName: this.getSiteName(),
						},
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
					'As a contributor, you will be able to write and manage your own posts, but you will not be able to publish.'
				);
				break;
			case 'subscriber':
				explanation = this.translate(
					'As a subscriber, you will be able to manage your profile on %(siteName)s.',
					{
						args: {
							siteName: this.getSiteName(),
						},
					}
				);
				break;
			case 'viewer':
				explanation = this.translate(
					'As a viewer, you will be able to view the private site %(siteName)s.',
					{
						args: {
							siteName: this.getSiteName(),
						},
					}
				);
				break;
			case 'follower':
				explanation = this.translate(
					'As a follower, you can read the latest posts from %(siteName)s in the WordPress.com Reader.',
					{
						args: {
							siteName: this.getSiteName(),
						},
					}
				);
				break;
		}

		return explanation;
	},

	render() {
		let roleExplanation = this.getExplanationForInvite();
		return (
			<div className="invite-form-header">
				<h3 className="invite-form-header__title">
					{ this.props.user ? this.getLoggedInTitleForInvite() : this.getLoggedOutTitleForInvite() }
				</h3>
				{ roleExplanation && (
					<p className="invite-form-header__explanation">{ roleExplanation }</p>
				) }
			</div>
		);
	},
} );
