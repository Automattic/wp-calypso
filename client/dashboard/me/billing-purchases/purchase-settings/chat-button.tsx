import config from '@automattic/calypso-config';
import { useChatStatus } from '@automattic/help-center/src/hooks';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { Button } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { Icon, comment } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useAnalytics } from '../../../app/analytics';
import { useHelpCenter } from '../../../app/help-center';
import type { FC } from 'react';

type APIFetchOptions = {
	global: boolean;
	path: string;
};
type MessagingAvailability = {
	is_available: boolean;
};
type MessagingGroup = 'jp_presales' | 'wpcom_messaging' | 'wpcom_presales';

type ChatIntent = 'SUPPORT' | 'PRESALES' | 'PRECANCELLATION';

type Props = {
	chatIntent?: ChatIntent;
	className?: string;
	initialMessage: string;
	onClick?: () => void;
	onError?: () => void;
	primary?: boolean;
	siteUrl?: string;
	siteId?: string | number;
	children?: React.ReactNode;
	withHelpCenter?: boolean;
	section?: string;
};

function useZendeskMessagingAvailability( group: MessagingGroup, enabled = true ) {
	return useQuery< MessagingAvailability >( {
		queryKey: [ 'zendeskMessagingAvailability', group ],
		queryFn: () => {
			const currentEnvironment = config( 'env_id' );
			const params = {
				group: group as string,
				environment: currentEnvironment === 'development' ? 'development' : 'production',
			};
			const wpcomParams = new URLSearchParams( params );

			return canAccessWpcomApis()
				? wpcomRequest< MessagingAvailability >( {
						path: '/help/support-status/messaging',
						apiNamespace: 'wpcom/v2',
						query: wpcomParams.toString(),
						method: 'GET',
				  } )
				: apiFetch< MessagingAvailability >( {
						path: addQueryArgs( '/help-center/support-status/messaging', params ),
						method: 'GET',
						global: true,
				  } as APIFetchOptions );
		},
		staleTime: 60 * 1000, // 1 minute
		meta: {
			persist: false,
		},
		enabled,
	} );
}

function fetchZendeskConfig() {
	// Parse the JSON to throw errors for all non-success responses
	return fetch( 'https://wpcom.zendesk.com/embeddable/config' ).then( ( res ) => res.json() );
}

/**
 * This hook verifies connectivity to Zendesk's messaging service by making a config request and manages automatic retries with error tracking.
 */
function useCanConnectToZendeskMessaging( enabled = true ) {
	const { recordTracksEvent } = useAnalytics();
	const query = useQuery< boolean, Error >( {
		queryKey: [ 'canConnectToZendesk' ],
		queryFn: fetchZendeskConfig,
		staleTime: Infinity,
		// Retry 3 times with a 1 second delay between each retry
		retry: 3,
		retryDelay: 1000,
		refetchOnMount: false,
		retryOnMount: false,
		refetchOnWindowFocus: false,
		meta: {
			persist: false,
		},
		enabled,
		// Cast down to boolean.
		select: ( data ) => !! data,
	} );

	useEffect( () => {
		// Leaving for backwards compatibility. This event is no longer needed. The one below is more general.
		if ( ! query.data && query.status !== 'pending' ) {
			recordTracksEvent( 'calypso_helpcenter_zendesk_config_error', {
				status: query.status,
				status_text: query.error?.message,
			} );
		}

		recordTracksEvent( 'calypso_helpcenter_zendesk_config_request', {
			status: query.status,
			status_text: query.error?.message,
			failure_count: query.failureCount,
		} );
	}, [ recordTracksEvent, query.data, query.error?.message, query.status, query.failureCount ] );

	return query;
}

function getMessagingGroupForIntent( chatIntent: ChatIntent ): MessagingGroup {
	switch ( chatIntent ) {
		case 'PRESALES':
			return 'wpcom_presales';

		case 'PRECANCELLATION':
		case 'SUPPORT':
		default:
			return 'wpcom_messaging';
	}
}
const ChatButton: FC< Props > = ( {
	chatIntent = 'SUPPORT',
	children,
	className = '',
	initialMessage,
	onClick,
	primary = false,
	withHelpCenter = true,
} ) => {
	const { __ } = useI18n();
	const { hasActiveChats, isEligibleForChat, isPrecancellationChatOpen, isPresalesChatOpen } =
		useChatStatus();
	const messagingGroup = getMessagingGroupForIntent( chatIntent );
	const { data: isMessagingAvailable } = useZendeskMessagingAvailability(
		messagingGroup,
		isEligibleForChat
	);
	const { setNavigateToRoute, setSubject, setShowHelpCenter } = useHelpCenter();
	const { data: canConnectToZendesk } = useCanConnectToZendeskMessaging();

	function shouldShowChatButton(): boolean {
		if ( isEligibleForChat && hasActiveChats && canConnectToZendesk ) {
			return true;
		}

		switch ( chatIntent ) {
			case 'PRESALES':
				if ( ! isPresalesChatOpen ) {
					return false;
				}
				break;

			case 'PRECANCELLATION':
				if ( ! isPrecancellationChatOpen ) {
					return false;
				}
				break;
			default:
				break;
		}

		if ( isEligibleForChat && isMessagingAvailable && ( canConnectToZendesk || withHelpCenter ) ) {
			return true;
		}

		return false;
	}

	const handleClick = () => {
		if ( canConnectToZendesk && initialMessage ) {
			onClick?.();
			setSubject( initialMessage );
			setShowHelpCenter( true );
		} else {
			setNavigateToRoute( '/odie' );
			setShowHelpCenter( true );
			onClick?.();
		}
	};

	const classes = clsx( 'chat-button', className );

	if ( ! shouldShowChatButton() ) {
		return null;
	}

	function getChildren() {
		return children || <Icon icon={ comment } />;
	}

	return (
		<Button
			className={ classes }
			variant={ primary ? 'primary' : 'link' }
			onClick={ handleClick }
			title={ __( 'Contact us' ) }
			size="compact"
		>
			{ getChildren() }
		</Button>
	);
};

export default ChatButton;
