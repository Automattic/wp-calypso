import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import expiredIllustration from 'calypso/assets/images/customer-home/disconnected-dark.svg';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { TASK_REACTIVATE_EXPIRED_PLAN } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors/index';

export const ReactivateExpiredPlan = () => {
	const siteSlug = useSelector( getSelectedSiteSlug );

	if ( ! siteSlug ) {
		return null;
	}

	return (
		<Task
			isUrgent
			title={ translate( 'Restore your plan' ) }
			description={ translate(
				'Your plan expired and your site reverted to the Free plan. {{supportLink}}Follow these steps to continue using your previous features{{/supportLink}}, beginning with purchasing an eligible plan.{{lineBreak/}}No further action is needed if you wish to continue with the Free plan.',
				{
					components: {
						lineBreak: (
							<>
								<br />
								<br />
							</>
						),
						supportLink: (
							<InlineSupportLink
								supportPostId={ 222413 }
								supportLink={ localizeUrl(
									'https://wordpress.com/support/restore-your-site-after-the-plan-expires/'
								) }
								noWrap={ false }
								showIcon={ false }
								supportContext="reactivate"
								tracksEvent="calypso_customer_home_reactivate_support_page_view"
								statsGroup="calypso_customer_home"
								statsName="menus_view_tutorial"
							/>
						),
					},
				}
			) }
			timing={ 1 }
			taskId={ TASK_REACTIVATE_EXPIRED_PLAN }
			actionText={ translate( 'Purchase plan' ) }
			illustration={ expiredIllustration }
			actionUrl={ `/plans/${ siteSlug }` }
		/>
	);
};
