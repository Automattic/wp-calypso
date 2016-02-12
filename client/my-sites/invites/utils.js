/**
 * Internal dependencies
 */
import React from 'react';
import get from 'lodash/get'

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';

export default {
	acceptedNotice( invite, displayOnNextPage = true ) {
		let takeATour = (
			<p className="invite-message__intro">
				{
					i18n.translate(
						'Since you\'re new, you might like to {{docsLink}}take a tour{{/docsLink}}.',
						{ components: { docsLink: <a href="https://learn.wordpress.com/" target="_blank" /> } }
					)
				}
			</p>
		);
		let site = (
			<a href={ get( invite, 'site.URL' ) } className="invite-accept__notice-site-link">
				{ get( invite, 'site.title' ) }
			</a>
		);

		switch ( get( invite, 'role' ) ) {
			case 'follower':
				return [
					i18n.translate(
						'You are now following {{site/}}', {
							components: { site }
						}
					),
					{
						button: i18n.translate( 'Visit Site' ),
						href: get( invite, 'site.URL' ),
						displayOnNextPage
					}
				];
				break;
			case 'viewer':
				return [
					i18n.translate(
						'You are now a viewer of: {{site/}}', {
							components: { site }
						}
					),
					{
						button: i18n.translate( 'Visit Site' ),
						href: get( invite, 'site.URL' ),
						displayOnNextPage
					}
				];
				break;
			case 'administrator':
				return [
					<div>
						<h3 className="invite-message__title">
							{ i18n.translate( 'You\'re now an Administrator of: {{site/}}', {
								components: { site }
							} ) }
						</h3>
						<p className="invite-message__intro">
							{ i18n.translate( 'This is your site dashboard where you will be able to manage all aspects of %(site)s', {
								args: { site: get( invite, 'site.title' ) }
							} ) }
						</p>
						{ takeATour }
					</div>,
					{ displayOnNextPage }
				];
				break;
			case 'editor':
				return [
					<div>
						<h3 className="invite-message__title">
							{ i18n.translate( 'You\'re now an Editor of: {{site/}}', {
								components: { site }
							} ) }
						</h3>
						<p className="invite-message__intro">
							{ i18n.translate( 'This is your site dashboard where you can publish and manage your own posts and the posts of others, as well as upload media.' ) }
						</p>
						{ takeATour }
					</div>,
					{ displayOnNextPage }
				];
				break;
			case 'author':
				return [
					<div>
						<h3 className="invite-message__title">
							{ i18n.translate( 'You\'re now an Author of: {{site/}}', {
								components: { site }
							} ) }
						</h3>
						<p className="invite-message__intro">
							{ i18n.translate( 'This is your site dashboard where you can publish and edit your own posts as well as upload media.' ) }
						</p>
						{ takeATour }
					</div>,
					{ displayOnNextPage }
				];
				break;
			case 'contributor':
				return [
					<div>
						<h3 className="invite-message__title">
							{ i18n.translate( 'You\'re now a Contributor of: {{site/}}', {
								components: { site }
							} ) }
						</h3>
						<p className="invite-message__intro">
							{ i18n.translate( 'This is your site dashboard where you can write and manage your own posts.' ) }
						</p>
						{ takeATour }
					</div>,
					{ displayOnNextPage }
				];
				break;
			case 'subscriber':
				return [
					i18n.translate( 'You\'re now a Subscriber of: {{site/}}', {
						components: { site }
					} ),
					{ displayOnNextPage }
				];
				break;
		}
	},

	getRedirectAfterAccept( invite ) {
		switch ( invite.role ) {
			case 'viewer':
			case 'follower':
				return '/';
				break;
			default:
				return '/posts/' + invite.site.ID;
		}
	}
};
