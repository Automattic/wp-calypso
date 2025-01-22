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

const CancelPurchaseSupportLink = ( { purchase } ) => {
	const translate = useTranslate();
	const { siteId, siteUrl } = purchase;
	const { setShowHelpCenter, setNavigateToRoute } = useDataStoreDispatch( HELP_CENTER_STORE );
	const { isEligibleForChat } = useChatStatus();
	const { data: canConnectToZendeskMessaging } = useCanConnectToZendeskMessaging();
	const { data: isMessagingAvailable } = useZendeskMessagingAvailability(
		'wpcom_messaging',
		isEligibleForChat
	);
	const { isOpeningZendeskWidget } = useOpenZendeskMessaging(
		'migration-error',
		'zendesk_support_chat_key',
		isEligibleForChat
	);

	const getHelp = useCallback( () => {
		if ( isMessagingAvailable && canConnectToZendeskMessaging ) {
			setShowHelpCenter( true );
			setNavigateToRoute(
				`/odie?provider=zendesk&userFieldMessage=${ 'Purchase cancellation flow' }&siteUrl=${ siteUrl }&siteId=${ siteId }`
			);
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
		recordTracksEvent( 'calypso_cancellation_help_button_click' );
		getHelp();
	};

	return (
		<p className="cancel-purchase__support-link">
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

export default CancelPurchaseSupportLink;
