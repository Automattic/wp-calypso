import { useSmooch } from '@automattic/zendesk-client';
import { TabPanel } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { HelpCenterSupportChatMessage } from './help-center-support-chat-message';

import './help-center-chat-history.scss';

export const HelpCenterChatHistory = () => {
	const { __ } = useI18n();
	const TAB_STATES = {
		recent: 'recent',
		archived: 'archived',
	};

	// TODO: might not need to store activeTab in state
	// const [ activeTab, setActiveTab ] = useState( TAB_STATES.recent );
	const [ conversations, setConversations ] = useState( [] );
	const { init, getConversations } = useSmooch();

	const RecentConversations = ( { conversations } ) => {
		if ( ! conversations ) {
			return [];
		}

		return (
			<>
				{ conversations.map( ( conversation ) => {
					const lastMessage =
						Array.isArray( conversation.messages ) && conversation.messages.length > 0
							? conversation.messages[ conversation.messages.length - 1 ]
							: null;
					return (
						<HelpCenterSupportChatMessage
							key={ conversation.id }
							message={ lastMessage }
							navigateTo="odie"
						/>
					);
				} ) }
			</>
		);
	};

	useEffect( () => {
		if ( init ) {
			setConversations( getConversations() );
		}
	}, [ getConversations, init ] );

	return (
		<div className="help-center-chat-history">
			<TabPanel
				tabs={ [
					{
						name: TAB_STATES.recent,
						title: __( 'Recent' ),
						className: 'help-center-chat-history__recent',
					},
					{
						name: TAB_STATES.archived,
						title: __( 'Archived' ),
						className: 'help-center-chat-history__archived',
					},
				] }
				onSelect={ () => {
					// setActiveTab( tabName );
				} }
			>
				{ ( tab ) => {
					switch ( tab.name ) {
						case TAB_STATES.recent:
							return <RecentConversations conversations={ conversations } />;
						case TAB_STATES.archived:
							return <div>{ __( 'Archived Conversations' ) }</div>;
						default:
							return;
					}
				} }
			</TabPanel>
		</div>
	);
};
