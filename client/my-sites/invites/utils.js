/** @format */
/**
 * Internal dependencies
 */
import React from 'react';
import { get } from 'lodash';
import i18n from 'i18n-calypso';

export default {
	acceptedNotice( invite, displayOnNextPage = true ) {
		const site = (
			<a href={ get( invite, 'site.URL' ) } className="invite-accept__notice-site-link">
				{ get( invite, 'site.title' ) }
			</a>
		);

		switch ( get( invite, 'role' ) ) {
			case 'follower':
				return [
					i18n.translate( 'You are now following {{site/}}', {
						components: { site },
					} ),
					{
						button: i18n.translate( 'Visit Site' ),
						href: get( invite, 'site.URL' ),
						displayOnNextPage,
					},
				];

			case 'viewer':
				return [
					i18n.translate( 'You are now a viewer of: {{site/}}', {
						components: { site },
					} ),
					{
						button: i18n.translate( 'Visit Site' ),
						href: get( invite, 'site.URL' ),
						displayOnNextPage,
					},
				];

			case 'administrator':
				return [
					<div>
						<h3 className="invite-message__title">
							{ i18n.translate( "You're now an Administrator of: {{site/}}", {
								components: { site },
							} ) }
						</h3>
						<p className="invite-message__intro">
							{ i18n.translate(
								'This is your site dashboard where you will be able to manage all aspects of %(site)s',
								{
									args: { site: get( invite, 'site.title' ) },
								}
							) }
						</p>
					</div>,
					{ displayOnNextPage },
				];

			case 'editor':
				return [
					<div>
						<h3 className="invite-message__title">
							{ i18n.translate( "You're now an Editor of: {{site/}}", {
								components: { site },
							} ) }
						</h3>
						<p className="invite-message__intro">
							{ i18n.translate(
								'This is your site dashboard where you can publish and manage your own posts and the posts of others, as well as upload media.'
							) }
						</p>
					</div>,
					{ displayOnNextPage },
				];

			case 'author':
				return [
					<div>
						<h3 className="invite-message__title">
							{ i18n.translate( "You're now an Author of: {{site/}}", {
								components: { site },
							} ) }
						</h3>
						<p className="invite-message__intro">
							{ i18n.translate(
								'This is your site dashboard where you can publish and edit your own posts as well as upload media.'
							) }
						</p>
					</div>,
					{ displayOnNextPage },
				];

			case 'contributor':
				return [
					<div>
						<h3 className="invite-message__title">
							{ i18n.translate( "You're now a Contributor of: {{site/}}", {
								components: { site },
							} ) }
						</h3>
						<p className="invite-message__intro">
							{ i18n.translate(
								'This is your site dashboard where you can write and manage your own posts.'
							) }
						</p>
					</div>,
					{ displayOnNextPage },
				];

			case 'subscriber':
				return [
					i18n.translate( "You're now a Subscriber of: {{site/}}", {
						components: { site },
					} ),
					{ displayOnNextPage },
				];
		}
	},

	getRedirectAfterAccept( invite ) {
		const readerPath = '/';
		const postsListPath = '/posts/' + invite.site.ID;

		if ( get( invite, 'site.is_vip' ) ) {
			switch ( invite.role ) {
				case 'viewer':
				case 'follower':
					return get( invite, 'site.URL' ) || readerPath;

				default:
					return get( invite, 'site.admin_url' ) || postsListPath;
			}
		}

		switch ( invite.role ) {
			case 'viewer':
			case 'follower':
				return readerPath;

			default:
				return postsListPath;
		}
	},
};
