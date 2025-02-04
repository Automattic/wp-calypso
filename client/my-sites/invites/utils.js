import i18n from 'i18n-calypso';
import { get } from 'lodash';
import { logmeinUrl } from 'calypso/lib/logmein';

export function acceptedNotice( invite, displayOnNextPage = true ) {
	const site = (
		<a href={ get( invite, 'site.URL' ) } className="invites__notice-site-link">
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
					<h3 className="invites__title">
						{ i18n.translate( "You're now an Administrator of: {{site/}}", {
							components: { site },
						} ) }
					</h3>
					<p className="invites__intro">
						{ i18n.translate(
							'This is your site dashboard where you will be able to manage all aspects of %(site)s',
							{
								args: { site: get( invite, 'site.title' ) },
							}
						) }
					</p>
					<p>
						{ i18n.translate(
							'Not sure where to start? Head on over to {{a}}Learn WordPress{{/a}}.',
							{
								components: { a: <a href="http://learn.wordpress.com" /> },
							}
						) }
					</p>
				</div>,
				{ displayOnNextPage },
			];

		case 'editor':
			return [
				<div>
					<h3 className="invites__title">
						{ i18n.translate( "You're now an Editor of: {{site/}}", {
							components: { site },
						} ) }
					</h3>
					<p className="invites__intro">
						{ i18n.translate(
							'This is your site dashboard where you can publish and manage your ' +
								'own posts and the posts of others, as well as upload media.'
						) }
					</p>
					<p>
						{ i18n.translate(
							'Not sure where to start? Head on over to {{a}}Learn WordPress{{/a}}.',
							{
								components: { a: <a href="http://learn.wordpress.com" /> },
							}
						) }
					</p>
				</div>,
				{ displayOnNextPage },
			];

		case 'author':
			return [
				<div>
					<h3 className="invites__title">
						{ i18n.translate( "You're now an Author of: {{site/}}", {
							components: { site },
						} ) }
					</h3>
					<p className="invites__intro">
						{ i18n.translate(
							'This is your site dashboard where you can publish and ' +
								'edit your own posts as well as upload media.'
						) }
					</p>
					<p>
						{ i18n.translate(
							'Not sure where to start? Head on over to {{a}}Learn WordPress{{/a}}.',
							{
								components: { a: <a href="http://learn.wordpress.com" /> },
							}
						) }
					</p>
				</div>,
				{ displayOnNextPage },
			];

		case 'contributor':
			return [
				<div>
					<h3 className="invites__title">
						{ i18n.translate( "You're now a Contributor of: {{site/}}", {
							components: { site },
						} ) }
					</h3>
					<p className="invites__intro">
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
		default:
			return [
				i18n.translate( "You're now a new member of: {{site/}}", {
					components: { site },
				} ),
				{ displayOnNextPage },
			];
	}
}

export function getRedirectAfterAccept( invite ) {
	if ( invite.site.is_wpforteams_site ) {
		return `https://${ invite.site.domain }`;
	}

	const readerPath = '/reader';
	const postsListPath = '/posts/' + invite.site.ID;
	const myHomePath = '/home/' + invite.site.domain;
	const getDestinationUrl = ( redirect ) => {
		const remoteLoginHost = `https://${ invite.site.domain }`;
		const remoteLoginBackUrl = ( destinationPath ) => `https://wordpress.com${ destinationPath }`;
		const destination = logmeinUrl( remoteLoginHost, remoteLoginBackUrl( redirect ) );
		const isMissingLogmein = destination === remoteLoginHost;
		return isMissingLogmein ? redirect : destination;
	};

	if ( invite.site.is_vip ) {
		switch ( invite.role ) {
			case 'viewer':
			case 'follower':
				return invite.site.URL || readerPath;

			default:
				return invite.site.admin_url || postsListPath;
		}
	}

	switch ( invite.role ) {
		case 'viewer':
		case 'follower':
			return getDestinationUrl( readerPath );

		default:
			return getDestinationUrl( myHomePath );
	}
}

export const getExplanationForInvite = ( role, siteName, translate ) => {
	let explanation = '';

	switch ( role ) {
		case 'administrator':
			explanation = translate(
				'As an administrator, you will be able to manage all aspects of %(site)s.',
				{
					args: {
						site: siteName || '',
					},
				}
			);
			break;
		case 'editor':
			explanation = translate(
				'As an editor, you will be able to publish and manage your own posts and the posts of others, as well as upload media.'
			);
			break;
		case 'author':
			explanation = translate(
				'As an author, you will be able to publish and edit your own posts as well as upload media.'
			);
			break;
		case 'contributor':
			explanation = translate(
				'As a contributor, you will be able to write and manage your own posts, but you will not be able to publish.'
			);
			break;
		case 'subscriber':
			explanation = translate(
				'As a viewer, you will be able to manage your profile on %(site)s.',
				{
					args: {
						site: siteName || '',
					},
				}
			);
			break;
		case 'viewer':
			explanation = translate( 'As a viewer, you will be able to view the private site %(site)s.', {
				args: {
					site: siteName || '',
				},
			} );
			break;
		case 'follower':
			explanation = translate(
				'As a follower, you can read the latest posts from %(site)s in the WordPress.com Reader.',
				{
					args: {
						site: siteName || '',
					},
				}
			);
			break;
	}

	return explanation;
};
