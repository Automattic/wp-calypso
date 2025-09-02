import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { __, _n } from '@wordpress/i18n';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOdieAssistantContext } from '../../context';
import { useGetSupportInteractionById } from '../../data';
import { useGetMostRecentOpenConversation } from '../../hooks/use-get-most-recent-open-conversation';

export default function useViewMostRecentOpenConversationNotice( isEnabled: boolean ) {
	const { mostRecentSupportInteractionId, totalNumberOfConversations } =
		useGetMostRecentOpenConversation();

	const fetchSupportInteraction =
		mostRecentSupportInteractionId?.toString() && totalNumberOfConversations === 1
			? mostRecentSupportInteractionId.toString()
			: null;
	const { data: supportInteraction } = useGetSupportInteractionById( fetchSupportInteraction );
	const { setCurrentSupportInteraction } = useDataStoreDispatch( HELP_CENTER_STORE );
	const [ notice, setNotice ] = useState< React.ReactNode | null >( null );
	const { trackEvent } = useOdieAssistantContext();
	const location = useLocation();
	const navigate = useNavigate();
	const shouldDisplayNotice = supportInteraction || totalNumberOfConversations > 1;

	const handleNoticeOnClick = useCallback( () => {
		if ( supportInteraction ) {
			setCurrentSupportInteraction( supportInteraction );
			if ( ! location.pathname.includes( '/odie' ) ) {
				navigate( '/odie' );
			}
		} else {
			navigate( '/chat-history' );
		}
		trackEvent( 'chat_open_previous_conversation_notice', {
			destination: supportInteraction ? 'support-interaction' : 'chat-history',
			total_number_of_conversations: totalNumberOfConversations,
		} );

		setNotice( null );
	}, [
		supportInteraction,
		setCurrentSupportInteraction,
		location.pathname,
		navigate,
		trackEvent,
		totalNumberOfConversations,
		setNotice,
	] );

	useEffect( () => {
		if ( isEnabled && shouldDisplayNotice ) {
			setNotice(
				<div className="odie-notice__view-conversation">
					<span>
						{ __( 'You have another open conversation already started.', __i18n_text_domain__ ) }
					</span>
					&nbsp;
					<button onClick={ handleNoticeOnClick }>
						{ _n(
							'View conversation',
							'View conversations',
							totalNumberOfConversations,
							__i18n_text_domain__
						) }
					</button>
				</div>
			);
		}
	}, [
		shouldDisplayNotice,
		setNotice,
		handleNoticeOnClick,
		totalNumberOfConversations,
		isEnabled,
	] );

	return notice;
}
