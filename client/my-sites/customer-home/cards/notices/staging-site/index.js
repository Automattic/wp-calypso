import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import stagingIllustration from 'calypso/assets/images/customer-home/illustration--staging.svg';
import { NOTICE_STAGING_SITE } from 'calypso/my-sites/customer-home/cards/constants';
import CelebrateNotice, {
	CelebrateNoticePlaceholder,
} from 'calypso/my-sites/customer-home/cards/notices/celebrate-notice';
import { useProductionSiteDetailsForWpcomStaging } from 'calypso/my-sites/customer-home/cards/notices/staging-site/use-production-site-details-for-wpcom-staging';
import { getSiteHomeUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const StagingSiteNotice = () => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const {
		loading,
		data: { name: productionSiteName, id: productionSiteId },
	} = useProductionSiteDetailsForWpcomStaging( siteId );

	const productionHomeUrl = useSelector( ( state ) => getSiteHomeUrl( state, productionSiteId ) );
	const showNotice = ! loading && productionSiteName && productionSiteId && productionHomeUrl;

	return (
		<>
			{ showNotice ? (
				<CelebrateNotice
					description={ createInterpolateElement(
						sprintf(
							/* translators: %s - The WordPress.com production site. (ex.: wordpress.com/home/subdomain.wordpress.com) */
							__(
								'This is a staging site for <a>%s</a> that you can use to try out new plugins and themes, debug and troubleshoot changes, and fine-tune every aspect of your website without worrying about breaking your live site.'
							),
							productionSiteName
						),
						{
							a: (
								<Button
									style={ { fontSize: 'inherit' } }
									variant="link"
									href={ productionHomeUrl }
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
