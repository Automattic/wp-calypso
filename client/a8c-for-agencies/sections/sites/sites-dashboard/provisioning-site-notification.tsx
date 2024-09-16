import { Button } from '@automattic/components';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import useIsSiteReady from 'calypso/a8c-for-agencies/data/sites/use-is-site-ready';
import { addQueryArgs } from 'calypso/lib/url';

type Props = {
	siteId: number;
	migrationIntent: boolean;
	isDevSite?: boolean;
};

export default function ProvisioningSiteNotification( {
	siteId,
	migrationIntent,
	isDevSite,
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

	let title = translate( 'Setting up your new WordPress.com site' );
	let content = translate(
		"We're setting up your new WordPress.com site and will notify you once it's ready, which should only take a few minutes."
	);

	if ( isReady ) {
		if ( isDevSite ) {
			title = translate( 'Your WordPress.com development site is ready!' );
			content = translate(
				'{{a}}%(siteURL)s{{/a}} is now ready. Get started by configuring your new development site. It may take a few minutes for it to show up in the site list below.',
				{
					args: { siteURL: site?.url ?? '' },
					components: {
						a: <a href={ wpOverviewUrl } target="_blank" rel="noreferrer" />,
					},
					comment: 'The %(siteURL)s is the URL of the site that has been provisioned.',
				}
			);
		} else {
			title = translate( 'Your WordPress.com site is ready!' );
			content = translate(
				'{{a}}%(siteURL)s{{/a}} is now ready. Get started by configuring your new site. It may take a few minutes for it to show up in the site list below.',
				{
					args: { siteURL: site?.url ?? '' },
					components: {
						a: <a href={ wpOverviewUrl } target="_blank" rel="noreferrer" />,
					},
					comment: 'The %(siteURL)s is the URL of the site that has been provisioned.',
				}
			);
		}
	}

	return (
		showBanner && (
			<NoticeBanner
				level={ isReady ? 'success' : 'warning' }
				hideCloseButton={ ! isReady }
				onClose={ () => setShowBanner( false ) }
				title={ title }
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
				{ content }
			</NoticeBanner>
		)
	);
}
