import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

import './style.scss';

const PRESSABLE_LIMIT_NOTIFICATION_DISMISS_PREFERENCE = 'pressable-limit-notification-dismissed';

export const PressableUsageLimitNotice = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const agency = useSelector( getActiveAgency );
	const notifications = agency?.notifications ?? [];

	const pressablePlanUsageLimitExceeded = notifications.find(
		( notification ) => notification.reference === 'pressable_plan_usage_limit_exeeded'
	);
	const pressablePlanUsageLimitApproaching = notifications.find(
		( notification ) => notification.reference === 'pressable_plan_usage_limit_approaching'
	);
	const pressableLimitNotice =
		pressablePlanUsageLimitExceeded || pressablePlanUsageLimitApproaching;

	const notificationDismissedTimestamp = useSelector( ( state ) =>
		getPreference( state, PRESSABLE_LIMIT_NOTIFICATION_DISMISS_PREFERENCE )
	);

	const isDismissed = notificationDismissedTimestamp === pressableLimitNotice?.timestamp;

	const dismissNotice = () => {
		if ( pressableLimitNotice ) {
			dispatch(
				savePreference(
					PRESSABLE_LIMIT_NOTIFICATION_DISMISS_PREFERENCE,
					pressableLimitNotice.timestamp
				)
			);
			dispatch(
				recordTracksEvent( 'calypso_a4a_pressable_limit_notification_dismissed', {
					type: pressableLimitNotice.reference,
				} )
			);
		}
	};

	if ( isDismissed || ! pressableLimitNotice ) {
		return null;
	}

	const level = pressablePlanUsageLimitExceeded ? 'warning' : 'info';
	// todo: add learn more link
	const learnMoreLink = false;

	return (
		<LayoutBanner
			level={ level }
			title={ translate( 'Upgrade Pressable' ) }
			onClose={ dismissNotice }
			className="pressable-usage-limit-notice"
		>
			<p className="pressable-usage-limit-notice__message">
				{ pressablePlanUsageLimitExceeded
					? translate(
							'Your Pressable plan has exceeded its allocated limits. Consider upgrading your plan to avoid additional fees.'
					  )
					: translate(
							'Your Pressable plan is close to exceeding its allocated limits. Consider upgrading your plan to avoid additional fees.'
					  ) }
			</p>

			<div className="pressable-usage-limit-notice__actions">
				<Button
					className="is-dark"
					href={ A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK }
					onClick={ () => {
						dispatch(
							recordTracksEvent( 'calypso_a4a_pressable_limit_notification_upgrade_click' )
						);
					} }
				>
					{ translate( 'Upgrade now' ) }
				</Button>

				{ learnMoreLink && (
					<Button
						variant="secondary"
						target="_blank"
						href={ learnMoreLink }
						onClick={ () => {
							dispatch(
								recordTracksEvent( 'calypso_a4a_pressable_limit_notification_learn_more_click' )
							);
						} }
					>
						{ translate( 'Learn more' ) }
						<Icon icon={ external } size={ 18 } />
					</Button>
				) }
			</div>
		</LayoutBanner>
	);
};

export default PressableUsageLimitNotice;
