import { TITAN_MAIL_YEARLY_SLUG } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import { TASK_UPSELL_TITAN } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';
import { getSiteAvailableProduct } from 'calypso/state/sites/products/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const TitanBanner = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const emailComparisonPath = getEmailManagementPath( siteSlug, siteSlug );
	const productSlug = TITAN_MAIL_YEARLY_SLUG;
	const siteProduct = useSelector( ( state ) =>
		siteId ? getSiteAvailableProduct( state, siteId, productSlug ) : null
	);
	const trialMonths = siteProduct?.introductory_offer?.interval_unit === 'year' ? 12 : 3;
	const bannerTitle =
		siteProduct?.introductory_offer?.interval_unit === 'year'
			? translate( 'Get %(months)d months free Professional Email', {
					args: {
						months: trialMonths,
					},
					comment: '%(months)d is the number of free trial months',
			  } )
			: translate( 'Get 3 months free Professional Email' );
	return (
		<>
			{ siteId && <QuerySiteProducts siteId={ siteId } /> }
			<Task
				title={ bannerTitle }
				description={ translate(
					'Build your brand with a custom @%(domain)s email address. Professional Email helps promote your site with every email you send.',
					{
						args: {
							domain: siteSlug,
						},
					}
				) }
				actionText={ translate( 'Add email for free' ) }
				actionUrl={ emailComparisonPath }
				completeOnStart={ false }
				enableSkipOptions
				illustration={ emailIllustration }
				taskId={ TASK_UPSELL_TITAN }
				timing={ 3 }
			/>
		</>
	);
};

export default TitanBanner;
