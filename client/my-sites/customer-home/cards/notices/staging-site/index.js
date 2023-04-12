import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import stagingIllustration from 'calypso/assets/images/customer-home/illustration--staging.svg';
import { urlToSlug } from 'calypso/lib/url';
import { NOTICE_STAGING_SITE } from 'calypso/my-sites/customer-home/cards/constants';
import CelebrateNotice, {
	CelebrateNoticePlaceholder,
} from 'calypso/my-sites/customer-home/cards/notices/celebrate-notice';
import { useProductionSiteDetail } from 'calypso/my-sites/hosting/staging-site-card/use-production-site-detail';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const StagingSiteNotice = () => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const { loading, data: productionSite } = useProductionSiteDetail( siteId );

	return (
		<>
			{ ! loading && productionSite ? (
				<CelebrateNotice
					description={ createInterpolateElement(
						sprintf(
							/* translators: %s - The WordPress.com production site. (ex.: wordpress.com/home/subdomain.wordpress.com) */
							__(
								'This is a staging site for <a>%s</a> that you can use to try out new plugins and themes, debug and troubleshoot changes, and fine-tune every aspect of your website without worrying about breaking your production site.'
							),
							productionSite.name
						),
						{
							a: (
								<Button
									style={ { fontSize: 'inherit' } }
									variant="link"
									href={ `/home/${ urlToSlug( productionSite.url ) }` }
								/>
							),
						}
					) }
					noticeId={ NOTICE_STAGING_SITE }
					title={ __( 'Staging site' ) }
					illustration={ stagingIllustration }
					showAction={ false }
					showSkip={ false }
				/>
			) : (
				<CelebrateNoticePlaceholder />
			) }
		</>
	);
};

export default StagingSiteNotice;
