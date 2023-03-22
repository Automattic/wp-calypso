import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { connect } from 'react-redux';
import stagingIllustration from 'calypso/assets/images/customer-home/illustration--staging.svg';
import { NOTICE_STAGING_SITE } from 'calypso/my-sites/customer-home/cards/constants';
import CelebrateNotice, {
	CelebrateNoticePlaceholder,
} from 'calypso/my-sites/customer-home/cards/notices/celebrate-notice';
import { getSiteHomeUrl, getSiteTitle } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const StagingSiteNotice = ( { productionSiteTitle, productionSiteHomeUrl } ) => {
	return (
		<>
			{ productionSiteTitle && productionSiteHomeUrl ? (
				<CelebrateNotice
					description={ createInterpolateElement(
						sprintf(
							/* translators: %s - The WordPress.com production site. (ex.: wordpress.com/home/subdomain.wordpress.com) */
							__(
								'This is a staging site for <a>%s</a> that you can use to try out new plugins and themes, debug and troubleshoot changes, and fine-tune every aspect of your website without worrying about breaking your live site.'
							),
							productionSiteTitle
						),
						{
							a: (
								<Button
									style={ { fontSize: 'inherit' } }
									variant="link"
									href={ productionSiteHomeUrl }
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

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	let productionSiteHomeUrl = '';
	let productionSiteTitle = '';
	if ( site.options?.wpcom_production_blog_id ) {
		productionSiteHomeUrl = getSiteHomeUrl( state, site.options?.wpcom_production_blog_id );
		productionSiteTitle = getSiteTitle( state, site.options?.wpcom_production_blog_id );
	}
	return {
		productionSiteTitle,
		productionSiteHomeUrl,
	};
} )( StagingSiteNotice );
