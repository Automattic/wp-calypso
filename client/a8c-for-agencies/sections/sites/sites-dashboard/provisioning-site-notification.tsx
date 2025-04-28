import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import useShowFeedback from 'calypso/a8c-for-agencies/components/a4a-feedback/hooks/use-show-a4a-feedback';
import { FeedbackType } from 'calypso/a8c-for-agencies/components/a4a-feedback/types';
import {
	A4A_SITES_LINK_DEVELOPMENT,
	A4A_FEEDBACK_LINK,
	A4A_SITES_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useIsSiteReady from 'calypso/a8c-for-agencies/data/sites/use-is-site-ready';
import useTrackProvisioningSites from 'calypso/a8c-for-agencies/hooks/use-track-provisioning-sites';
import { addQueryArgs } from 'calypso/lib/url';

type BannerProps = {
	siteId: number;
	migration?: boolean;
	development?: boolean;
	onDismiss?: () => void;
};

function Banner( { siteId, migration, development, onDismiss }: BannerProps ) {
	const { isReady, site } = useIsSiteReady( { siteId } );
	const [ showBanner, setShowBanner ] = useState( true );

	const translate = useTranslate();

	const siteSlug = site?.url?.replace( /(^\w+:|^)\/\//, '' );
	const wpOverviewUrl = `https://wordpress.com/overview/${ siteSlug }`;
	const wpMigrationUrl = addQueryArgs(
		{
			siteId: site?.features.wpcom_atomic.blog_id,
			siteSlug,
		},
		'https://wordpress.com/setup/site-migration'
	);

	const { isFeedbackShown } = useShowFeedback( FeedbackType.PurchaseCompleted );

	const readySiteMessage = development
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

	const onClose = () => {
		setShowBanner( false );
		onDismiss?.();
	};

	const handleRedirectToFeedback = () => {
		if ( isFeedbackShown ) {
			return;
		}
		onClose();
		page.redirect(
			addQueryArgs(
				{
					type: FeedbackType.PurchaseCompleted,
					redirectUrl: A4A_SITES_LINK,
				},
				A4A_FEEDBACK_LINK
			)
		);
	};

	return (
		showBanner && (
			<NoticeBanner
				level={ isReady ? 'success' : 'warning' }
				hideCloseButton={ ! isReady }
				onClose={ onClose }
				title={
					isReady
						? translate( 'Your WordPress.com site is ready!' )
						: translate( 'Setting up your new WordPress.com site' )
				}
				actions={
					isReady
						? [
								migration ? (
									<Button href={ wpMigrationUrl } target="_blank" rel="noreferrer" primary>
										{ translate( 'Migrate to this site' ) }
									</Button>
								) : (
									<Button
										onClick={ handleRedirectToFeedback }
										href={ wpOverviewUrl }
										target="_blank"
										rel="noreferrer"
										primary
									>
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

export default function ProvisioningSiteNotification() {
	const { provisioningSites, untrackSiteId } = useTrackProvisioningSites();

	return provisioningSites.map( ( { id, migration, development } ) => {
		return (
			<Banner
				key={ `provisioning_site_banner_${ id }` }
				siteId={ id }
				migration={ migration }
				development={ development }
				onDismiss={ () => untrackSiteId( id ) }
			/>
		);
	} );
}
