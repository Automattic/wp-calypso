import i18n from 'i18n-calypso';
import { logmeinUrl } from 'calypso/lib/logmein';

type InviteType = {
	site: {
		URL: string;
		title: string;
		is_wpforteams_site: boolean;
		ID: string;
		domain: string;
		admin_url: string;
		is_vip: boolean;
	};
	role: string;
};

export function acceptedNotice(
	invite: InviteType,
	displayOnNextPage = true,
	isPersistent = false
) {
	const siteUrl = invite?.site?.URL ?? '';
	const siteTitle = invite?.site?.title ?? '';
	const site = (
		<a href={ siteUrl } className="invites__notice-site-link">
			{ siteTitle }
		</a>
	);

	switch ( invite?.role ) {
		case 'follower':
			return [
				i18n.translate( 'You are now following {{site/}}', {
					components: { site },
				} ),
				{
					button: i18n.translate( 'Visit Site' ),
					href: siteUrl,
					displayOnNextPage,
					isPersistent,
				},
			];

		case 'viewer':
			return [
				i18n.translate( 'You are now a viewer of: {{site/}}', {
					components: { site },
				} ),
				{
					button: i18n.translate( 'Visit Site' ),
					href: siteUrl,
					displayOnNextPage,
					isPersistent,
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
					<p>
						{ i18n.translate(
							'Not sure where to start? Head on over to {{a}}Learn WordPress{{/a}}.',
							{
								components: { a: <a href="http://learn.wordpress.com" /> },
							}
						) }
					</p>
				</div>,
				{ displayOnNextPage, isPersistent },
			];

		case 'editor':
			return [
				<div>
					<h3 className="invites__title">
						{ i18n.translate( "You're now an Editor of: {{site/}}", {
							components: { site },
						} ) }
					</h3>
					<p>
						{ i18n.translate(
							'Not sure where to start? Head on over to {{a}}Learn WordPress{{/a}}.',
							{
								components: { a: <a href="http://learn.wordpress.com" /> },
							}
						) }
					</p>
				</div>,
				{ displayOnNextPage, isPersistent },
			];

		case 'author':
			return [
				<div>
					<h3 className="invites__title">
						{ i18n.translate( "You're now an Author of: {{site/}}", {
							components: { site },
						} ) }
					</h3>
					<p>
						{ i18n.translate(
							'Not sure where to start? Head on over to {{a}}Learn WordPress{{/a}}.',
							{
								components: { a: <a href="http://learn.wordpress.com" /> },
							}
						) }
					</p>
				</div>,
				{ displayOnNextPage, isPersistent },
			];

		case 'contributor':
			return [
				<div>
					<h3 className="invites__title">
						{ i18n.translate( "You're now a Contributor of: {{site/}}", {
							components: { site },
						} ) }
					</h3>
				</div>,
				{ displayOnNextPage, isPersistent },
			];

		case 'subscriber':
			return [
				i18n.translate( "You're now a Subscriber of: {{site/}}", {
					components: { site },
				} ),
				{ displayOnNextPage, isPersistent },
			];
		default:
			return [
				i18n.translate( "You're now a new member of: {{site/}}", {
					components: { site },
				} ),
				{ displayOnNextPage, isPersistent },
			];
	}
}

export function getRedirectAfterAccept( invite: InviteType ) {
	if ( invite.site.is_wpforteams_site ) {
		return `https://${ invite.site.domain }`;
	}

	const readerPath = '/reader';
	const postsListPath = '/posts/' + invite.site.ID;
	const mySitesPath = '/sites';
	const getDestinationUrl = ( redirect: string ) => {
		const remoteLoginHost = `https://${ invite.site.domain }`;
		const remoteLoginBackUrl = ( destinationPath: string ) =>
			`https://wordpress.com${ destinationPath }`;
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
			return getDestinationUrl( mySitesPath );
	}
}
