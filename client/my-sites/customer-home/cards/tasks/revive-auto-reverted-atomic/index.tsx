import { ExternalLinkWithTracking } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import disconnectedIllustration from 'calypso/assets/images/customer-home/disconnected-dark.svg';
import {
	TASK_REACTIVATE_ATOMIC_TRANSFER,
	TASK_REACTIVATE_EXPIRED_PLAN,
	TASK_REACTIVATE_RESTORE_BACKUP,
} from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { useSelector } from 'calypso/state';
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
			tracksEventName="calypso_customer_home_restore_site_support_page_click"
		/>
	);

	const taskProps = ( function () {
		switch ( card ) {
			case TASK_REACTIVATE_EXPIRED_PLAN:
				return {
					title: translate( 'Renew Your Plan' ),
					description: translate(
						'Your plan expired and your site reverted to the Free plan. {{supportLink}}Follow these steps to continue using your previous features{{/supportLink}}, beginning with purchasing an eligible plan.{{lineBreak/}}No further action is needed if you wish to continue with the Free plan.',
						{
							components: { lineBreak, supportLink },
						}
					),
					timing: 1,
					actionText: translate( 'Renew Your Plan' ),
					actionUrl: `/plans/${ siteSlug }`,
				};

			case TASK_REACTIVATE_ATOMIC_TRANSFER:
				return {
					title: translate( 'Activate Hosting Features' ),
					description: translate(
						'When your plan previously expired, your site lost access to hosting features, including plugins. {{supportLink}}Follow these steps to continue using your previous features{{/supportLink}}, by re-activating hosting configuration.{{lineBreak/}}No further action is needed if you do not need hosting features.',
						{
							components: { lineBreak, supportLink },
						}
					),
					timing: 2,
					actionText: translate( 'Activate Hosting Features' ),
					actionUrl: `/hosting-config/${ siteSlug }`,
					enableSkipOptions: false,
					skipText: translate( 'I do not need hosting features' ),
				};

			case TASK_REACTIVATE_RESTORE_BACKUP:
				return {
					title: translate( 'Restore a Backup' ),
					description: translate(
						'When your plan previously expired, your site reverted. {{supportLink}}Follow these steps to restore a backup{{/supportLink}}, restoring your site to how it looked before the plan expired.{{lineBreak/}}No further action is needed if you do not need to restore from a backup.',
						{
							components: { lineBreak, supportLink },
						}
					),
					timing: 30,
					actionText: translate( 'Restore a Backup' ),
					actionUrl: `/backup/${ siteSlug }`,
					enableSkipOptions: false,
					skipText: translate( 'I do not need to restore from a backup' ),
				};
		}
	} )();

	return (
		<Task isUrgent { ...taskProps } taskId={ card } illustration={ disconnectedIllustration } />
	);
};

const ATOMIC_REVIVAL_TASKS = [
	TASK_REACTIVATE_EXPIRED_PLAN,
	TASK_REACTIVATE_ATOMIC_TRANSFER,
	TASK_REACTIVATE_RESTORE_BACKUP,
] as const;

type AtomicRevivalTask = ( typeof ATOMIC_REVIVAL_TASKS )[ number ];

function isRevivalTask( card: string ): card is AtomicRevivalTask {
	return ATOMIC_REVIVAL_TASKS.includes( card as AtomicRevivalTask );
}
