import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import useIsSiteReady from 'calypso/a8c-for-agencies/data/sites/use-is-site-ready';

type Props = {
	siteId: number;
	onClose?: () => void;
};

export default function ProvisioningSiteNotification( { siteId, onClose }: Props ) {
	const { isReady, site } = useIsSiteReady( { siteId } );

	const translate = useTranslate();

	return (
		<NoticeBanner
			level={ isReady ? 'success' : 'warning' }
			hideCloseButton={ ! isReady }
			onClose={ onClose }
		>
			{ isReady
				? translate( 'Your {{a}}%(siteURL)s{{/a}} is now ready.', {
						args: { siteURL: site?.url ?? '' },
						components: {
							a: (
								<a
									href={ `https://wordpress.com/home/${ site?.url?.replace(
										/(^\w+:|^)\/\//,
										''
									) }` }
									target="_blank"
									rel="noreferrer"
								/>
							),
						},
						comment: 'The %(siteURL)s is the URL of the site that has been provisioned.',
				  } )
				: translate(
						"We're setting up your new WordPress.com site and will notify you once it's ready, which should only take a few minutes."
				  ) }
		</NoticeBanner>
	);
}
