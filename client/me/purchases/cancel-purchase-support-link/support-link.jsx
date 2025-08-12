import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenter } from '@automattic/data-stores';
import { useChatStatus } from '@automattic/help-center/src/hooks';
import { useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
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
	const { data: canConnectToZendeskMessaging, isLoading } = useCanConnectToZendeskMessaging();

	const getHelp = useCallback( () => {
		if ( canConnectToZendeskMessaging ) {
			setNewMessagingChat( {
				initialMessage:
					usage === 'cancel-purchase' ? 'Purchase cancellation flow' : 'Plan downgrade flow',
				siteUrl: siteUrl,
				siteId: siteId,
			} );
		} else {
			setNavigateToRoute( '/odie' );
			setShowHelpCenter( true );
		}
	}, [
		siteId,
		siteUrl,
		canConnectToZendeskMessaging,
		setNewMessagingChat,
		setNavigateToRoute,
		setShowHelpCenter,
		usage,
	] );

	const onClick = () => {
		recordTracksEvent( 'calypso_support_link_help_button_click', {
			usage,
			is_user_eligible_for_chat: isEligibleForChat,
		} );
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
						contactLink: <Button variant="link" onClick={ onClick } disabled={ isLoading } />,
					},
				} ) }
			</span>
		</p>
	);
};

export default SupportLink;
