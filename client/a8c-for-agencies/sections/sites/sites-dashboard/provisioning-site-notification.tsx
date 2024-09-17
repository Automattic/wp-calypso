import { Button } from '@automattic/components';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { A4A_SITES_LINK_DEVELOPMENT } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useIsSiteReady from 'calypso/a8c-for-agencies/data/sites/use-is-site-ready';
import { addQueryArgs } from 'calypso/lib/url';

type Props = {
	siteId: number;
	migrationIntent: boolean;
	isDevelopmentSite?: boolean;
};

export default function ProvisioningSiteNotification( {
	siteId,
	migrationIntent,
	isDevelopmentSite,
}: Props ) {
	const { isReady, site } = useIsSiteReady( { siteId } );
	const [ showBanner, setShowBanner ] = useState( true );

	useEffect( () => {
		if ( siteId ) {
			setShowBanner( true );
		}
	}, [ siteId ] );

	const translate = useTranslate();

	const siteSlug = site?.url?.replace( /(^\w+:|^)\/\//, '' );
	const wpOverviewUrl = `https://wordpress.com/overview/${ siteSlug }`;
	const wpMigrationUrl = addQueryArgs(
		{
			siteId: site?.features.wpcom_atomic.blog_id,
			siteSlug,
		},
		'https://wordpress.com/setup/hosted-site-migration/site-migration-identify'
	);

	const readySiteMessage = isDevelopmentSite
		? translate(
				'{{a}}%(siteURL)s{{/a}} is now ready. It may take a few minutes for it to show up in the site list below. Before the site launches, you will be able to find it under {{developmentTabLink}}Development{{/developmentTabLink}}.',
				{
					args: { siteURL: site?.url ?? '' },
					components: {
						a: <a href={ wpOverviewUrl } target="_blank" rel="noreferrer" />,
						developmentTabLink: <a href={ A4A_SITES_LINK_DEVELOPMENT } rel="noreferrer" />,
					},
					comment: 'The %(siteURL)s is the URL of the site that has been provisioned.',
				}
		  )
		: translate(
				'{{a}}%(siteURL)s{{/a}} is now ready. It may take a few minutes for it to show up in the site list below.',
				{
					args: { siteURL: site?.url ?? '' },
					components: {
						a: <a href={ wpOverviewUrl } target="_blank" rel="noreferrer" />,
					},
					comment: 'The %(siteURL)s is the URL of the site that has been provisioned.',
				}
		  );

	return (
		showBanner && (
			<NoticeBanner
				level={ isReady ? 'success' : 'warning' }
				hideCloseButton={ ! isReady }
				onClose={ () => setShowBanner( false ) }
				title={
					isReady
						? translate( 'Your WordPress.com site is ready!' )
						: translate( 'Setting up your new WordPress.com site' )
				}
				actions={
					isReady
						? [
								migrationIntent ? (
									<Button href={ wpMigrationUrl } target="_blank" rel="noreferrer" primary>
										{ translate( 'Migrate to this site' ) }
									</Button>
								) : (
									<Button href={ wpOverviewUrl } target="_blank" rel="noreferrer" primary>
										{ translate( 'Set up your site' ) }
									</Button>
								),
						  ]
						: undefined
				}
			>
				{ isReady
					? readySiteMessage
					: translate(
							"We're setting up your new WordPress.com site and will notify you once it's ready, which should only take a few minutes."
					  ) }
			</NoticeBanner>
		)
	);
}
