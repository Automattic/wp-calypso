import { WPCOM_FEATURES_TITAN_MAIL_1YEAR_TRIAL } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import { TASK_UPSELL_TITAN } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const TitanBanner = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const emailComparisonPath = getEmailManagementPath( siteSlug, siteSlug );
	const hasOneYearTrial = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_TITAN_MAIL_1YEAR_TRIAL )
	);
	const trialMonths = hasOneYearTrial ? 12 : 3;

	return (
		<Task
			title={ translate( 'Get %(months)d months free Professional Email', {
				args: {
					months: trialMonths,
				},
				comment: '%(months)d is the number of free trial months',
			} ) }
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
	);
};

export default TitanBanner;
