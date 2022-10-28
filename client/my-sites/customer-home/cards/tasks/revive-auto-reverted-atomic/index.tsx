import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import disconnectedDarkIllustration from 'calypso/assets/images/customer-home/disconnected-dark.svg';
import disconnectedLightIllustration from 'calypso/assets/images/customer-home/disconnected.svg';
import ExternalLinkWithTracking from 'calypso/components/external-link/with-tracking';
import {
	TASK_REACTIVATE_ATOMIC_TRANSFER,
	TASK_REACTIVATE_EXPIRED_PLAN,
	TASK_REACTIVATE_RESTORE_BACKUP,
} from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors/index';

export const ReviveAutoRevertedAtomic = ( { card }: { card: string } ) => {
	const siteSlug = useSelector( getSelectedSiteSlug );

	if ( ! siteSlug || ! isRevivalTask( card ) ) {
		return null;
	}

	const lineBreak = (
		<>
			<br />
			<br />
		</>
	);

	const supportLink = (
		<ExternalLinkWithTracking
			icon
			href={ localizeUrl(
				'https://wordpress.com/support/restore-your-site-after-the-plan-expires/'
			) }
			tracksEventName="calypso_customer_home_reactivate_support_page_view"
		/>
	);

	const taskProps = ( function () {
		switch ( card ) {
			case TASK_REACTIVATE_EXPIRED_PLAN:
				return {
					title: translate( 'Restore your plan' ),
					description: translate(
						'Your plan expired and your site reverted to the Free plan. {{supportLink}}Follow these steps to continue using your previous features{{/supportLink}}, beginning with purchasing an eligible plan.{{lineBreak/}}No further action is needed if you wish to continue with the Free plan.',
						{
							components: { lineBreak, supportLink },
						}
					),
					timing: 1,
					actionText: translate( 'Purchase plan' ),
					actionUrl: `/plans/${ siteSlug }`,
				};

			default:
				return {
					title: '',
					description: '',
					timing: 1,
					actionText: '',
					actionUrl: '',
					isUrgent: false,
				};
		}
	} )();

	return (
		<Task
			{ ...taskProps }
			taskId={ card }
			illustration={
				taskProps.isUrgent ? disconnectedDarkIllustration : disconnectedLightIllustration
			}
		/>
	);
};

const ATOMIC_REVIVAL_TASKS = [
	TASK_REACTIVATE_EXPIRED_PLAN,
	TASK_REACTIVATE_ATOMIC_TRANSFER,
	TASK_REACTIVATE_RESTORE_BACKUP,
] as const;

type AtomicRevivalTask = typeof ATOMIC_REVIVAL_TASKS[ number ];

function isRevivalTask( card: string ): card is AtomicRevivalTask {
	return ATOMIC_REVIVAL_TASKS.includes( card as AtomicRevivalTask );
}
