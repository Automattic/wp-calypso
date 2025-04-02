import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenter } from '@automattic/data-stores';
import { useChatStatus } from '@automattic/help-center/src/hooks';
import {
	useCanConnectToZendeskMessaging,
	useZendeskMessagingAvailability,
	useOpenZendeskMessaging,
} from '@automattic/zendesk-client';
import { Button } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { isRefundable, maybeWithinRefundPeriod } from 'calypso/lib/purchases';

const HELP_CENTER_STORE = HelpCenter.register();

const SupportLink = ( { purchase, usage } ) => {
	const translate = useTranslate();
	const { siteId, siteUrl } = purchase;
	const { setShowHelpCenter, setNavigateToRoute, setNewMessagingChat } =
		useDataStoreDispatch( HELP_CENTER_STORE );
	const { isEligibleForChat } = useChatStatus();
	const { data: canConnectToZendeskMessaging } = useCanConnectToZendeskMessaging();
	const { data: isMessagingAvailable } = useZendeskMessagingAvailability(
		'wpcom_messaging',
		isEligibleForChat
	);
	const { isOpeningZendeskWidget } = useOpenZendeskMessaging(
		'migration-error',
		isEligibleForChat
	);

	const getHelp = useCallback( () => {
		if ( isMessagingAvailable && canConnectToZendeskMessaging ) {
			setNewMessagingChat( {
				initialMessage:
					usage === 'cancel-purchase' ? 'Purchase cancellation flow' : 'Plan downgrade flow',
				siteUrl: siteUrl,
				siteId: siteId,
			} );
		} else {
			setNavigateToRoute( '/contact-options' );
			setShowHelpCenter( true );
		}
	}, [
		siteId,
		isMessagingAvailable,
		siteUrl,
		canConnectToZendeskMessaging,
		setNavigateToRoute,
		setShowHelpCenter,
	] );

	const onClick = () => {
		if ( usage === 'cancel-purchase' ) {
			recordTracksEvent( 'calypso_cancellation_help_button_click' );
		}
		getHelp();
	};

	return (
		<p className={ `${ usage }__support-link` }>
			<span>
				{ ! isRefundable( purchase ) && maybeWithinRefundPeriod( purchase )
					? translate( 'Have a question or seeking a refund?' )
					: translate( 'Need help with your purchase?' ) }{ ' ' }
				{ translate( '{{contactLink}}Ask a Happiness Engineer{{/contactLink}}.', {
					components: {
						contactLink: (
							<Button variant="link" onClick={ onClick } disabled={ isOpeningZendeskWidget } />
						),
					},
				} ) }
			</span>
		</p>
	);
};

export default SupportLink;
