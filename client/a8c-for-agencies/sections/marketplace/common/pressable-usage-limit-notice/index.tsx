import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

import './style.scss';

const PRESSABLE_LIMIT_NOTIFICATION_DISMISS_PREFERENCE = 'pressable-limit-notification-dismissed';

export const PressableUsageLimitNotice = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isDismissed = useSelector( ( state ) =>
		getPreference( state, PRESSABLE_LIMIT_NOTIFICATION_DISMISS_PREFERENCE )
	);

	const dismissNotice = () => {
		dispatch( savePreference( PRESSABLE_LIMIT_NOTIFICATION_DISMISS_PREFERENCE, true ) );
		dispatch( recordTracksEvent( 'calypso_a4a_pressable_limit_notification_dismissed' ) );
	};

	const showBanner = false; // TODO: Remove this when the banner is ready to be shown

	if ( isDismissed || ! showBanner ) {
		return null;
	}

	const learnMoreLink = ''; // TODO: Replace with actual link

	const limitTypes = {
		storage: translate( 'storage' ),
		traffic: translate( 'traffic' ),
	};

	const limitType = 'traffic'; // TODO: Replace with actual limit type
	const limitTypeHumanised = limitTypes[ limitType ];

	return (
		<LayoutBanner
			level="warning"
			title={ translate( 'Upgrade Pressable' ) }
			onClose={ dismissNotice }
			className="pressable-usage-limit-notice"
		>
			<div>
				{ translate(
					'Your Pressable plan has exceeded its allocated %s limit. Consider upgrading your plan to avoid additional fees.',
					{
						args: [ limitTypeHumanised ],
						comment: 'The limit type is storage or traffic which is already translated',
					}
				) }
			</div>

			<Button
				className="is-dark"
				href={ A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK }
				onClick={ () => {
					dispatch( recordTracksEvent( 'calypso_a4a_pressable_limit_notification_upgrade_click' ) );
				} }
			>
				{ translate( 'Upgrade now' ) }
			</Button>
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
		</LayoutBanner>
	);
};

export default PressableUsageLimitNotice;
