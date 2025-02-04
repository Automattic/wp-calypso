import { localizeUrl } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import NoSitesMessageLayout from 'calypso/components/empty-content/no-sites-message';

type SitesContainerProps = {
	status: string;

	// The number of sites the user has that match the specified status
	statusSiteCount: number;
};

export const NoSitesMessage = ( { status, statusSiteCount }: SitesContainerProps ) => {
	const { __ } = useI18n();

	if ( statusSiteCount > 0 ) {
		// If the user has some number of sites with this status, but the table is
		// still empty, it means the search query must not match any sites.
		return <h2>{ __( 'No sites match your search.' ) }</h2>;
	}

	if ( status === 'public' ) {
		return (
			<NoSitesMessageLayout
				title={ __( "You haven't launched a site" ) }
				line={ createInterpolateElement(
					__(
						'Our <a>support center</a> and team are here to help you as you work your way towards launch.'
					),
					{
						a: (
							<a
								href={ localizeUrl( 'https://wordpress.com/support/' ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					}
				) }
				illustration={ false }
			/>
		);
	}

	if ( status === 'private' ) {
		return (
			<NoSitesMessageLayout
				title={ __( 'You have no private sites' ) }
				line={ createInterpolateElement(
					__( "Private sites aren't accessible to the world. Read more about them <a>here</a>." ),
					{
						a: (
							<a
								href={ localizeUrl( 'https://wordpress.com/support/settings/privacy-settings/' ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					}
				) }
				illustration={ false }
			/>
		);
	}

	if ( status === 'coming-soon' ) {
		return (
			<NoSitesMessageLayout
				title={ __( 'You have no coming soon sites' ) }
				line={ createInterpolateElement(
					__(
						'Coming soon sites will display a landing page letting people know that a site is being built. Read more about them <a>here</a>.'
					),
					{
						a: (
							<a
								href={ localizeUrl( 'https://wordpress.com/support/settings/privacy-settings/' ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					}
				) }
				illustration={ false }
			/>
		);
	}

	if ( status === 'deleted' ) {
		return (
			<NoSitesMessageLayout
				title={ __( 'You have no deleted sites' ) }
				line={ createInterpolateElement(
					__(
						'Sites that are deleted can be restored within the first 30 days of deletion. Read more about restoring your site <a>here</a>.'
					),
					{
						a: (
							<a
								href={ localizeUrl(
									'https://wordpress.com/support/delete-site/#restore-a-deleted-site'
								) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					}
				) }
				illustration={ false }
				hideAction
			/>
		);
	}

	if ( status === 'redirect' ) {
		return (
			<NoSitesMessageLayout
				title={ __( 'You have no redirected sites' ) }
				line={ createInterpolateElement(
					__(
						'Redirected sites send a visitor directly to the mapped domain. Read more about them <a>here</a>.'
					),
					{
						a: (
							<a
								href={ localizeUrl( 'https://wordpress.com/support/site-redirect/' ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					}
				) }
				illustration={ false }
			/>
		);
	}

	return (
		<NoSitesMessageLayout
			title={ __( 'Create your first site' ) }
			action={ __( 'Create your first site' ) }
			actionURL="/start?source=sites-dashboard&ref=calypso-nosites"
		/>
	);
};
