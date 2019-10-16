/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';
import { translate } from 'i18n-calypso';

export function acceptedNotice( invite, displayOnNextPage = true ) {
	const site = (
		<a href={ get( invite, 'site.URL' ) } className="invites__notice-site-link">
			{ get( invite, 'site.title' ) }
		</a>
	);

	switch ( get( invite, 'role' ) ) {
		case 'follower':
			return [
				translate( 'You are now following {{site/}}', {
					components: { site },
				} ),
				{
					button: translate( 'Visit Site' ),
					href: get( invite, 'site.URL' ),
					displayOnNextPage,
				},
			];

		case 'viewer':
			return [
				translate( 'You are now a viewer of: {{site/}}', {
					components: { site },
				} ),
				{
					button: translate( 'Visit Site' ),
					href: get( invite, 'site.URL' ),
					displayOnNextPage,
				},
			];

		case 'administrator':
			return [
				<div>
					<h3 className="invites__title">
						{ translate( "You're now an Administrator of: {{site/}}", {
							components: { site },
						} ) }
					</h3>
					<p className="invites__intro">
						{ translate(
							'This is your site dashboard where you will be able to manage all aspects of %(site)s',
							{
								args: { site: get( invite, 'site.title' ) },
							}
						) }
					</p>
					<p>
						{ translate( 'Not sure where to start? Head on over to {{a}}Learn WordPress{{/a}}.', {
							components: { a: <a href="http://learn.wordpress.com" /> },
						} ) }
					</p>
				</div>,
				{ displayOnNextPage },
			];

		case 'editor':
			return [
				<div>
					<h3 className="invites__title">
						{ translate( "You're now an Editor of: {{site/}}", {
							components: { site },
						} ) }
					</h3>
					<p className="invites__intro">
						{ translate(
							'This is your site dashboard where you can publish and manage your ' +
								'own posts and the posts of others, as well as upload media.'
						) }
					</p>
					<p>
						{ translate( 'Not sure where to start? Head on over to {{a}}Learn WordPress{{/a}}.', {
							components: { a: <a href="http://learn.wordpress.com" /> },
						} ) }
					</p>
				</div>,
				{ displayOnNextPage },
			];

		case 'author':
			return [
				<div>
					<h3 className="invites__title">
						{ translate( "You're now an Author of: {{site/}}", {
							components: { site },
						} ) }
					</h3>
					<p className="invites__intro">
						{ translate(
							'This is your site dashboard where you can publish and ' +
								'edit your own posts as well as upload media.'
						) }
					</p>
					<p>
						{ translate( 'Not sure where to start? Head on over to {{a}}Learn WordPress{{/a}}.', {
							components: { a: <a href="http://learn.wordpress.com" /> },
						} ) }
					</p>
				</div>,
				{ displayOnNextPage },
			];

		case 'contributor':
			return [
				<div>
					<h3 className="invites__title">
						{ translate( "You're now a Contributor of: {{site/}}", {
							components: { site },
						} ) }
					</h3>
					<p className="invites__intro">
						{ translate(
							'This is your site dashboard where you can write and manage your own posts.'
						) }
					</p>
				</div>,
				{ displayOnNextPage },
			];

		case 'subscriber':
			return [
				translate( "You're now a Subscriber of: {{site/}}", {
					components: { site },
				} ),
				{ displayOnNextPage },
			];
		default:
			return [
				translate( "You're now a new member of: {{site/}}", {
					components: { site },
				} ),
				{ displayOnNextPage },
			];
	}
}

export function getRedirectAfterAccept( invite ) {
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
}
