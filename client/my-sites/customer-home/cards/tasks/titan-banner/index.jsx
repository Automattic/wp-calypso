import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import { TASK_UPSELL_TITAN } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const TitanBanner = () => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const emailComparisonPath = getEmailManagementPath( siteSlug, siteSlug );

	return (
		<Task
			title={ translate( 'Get 3 months free Professional Email' ) }
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
