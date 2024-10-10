import { getRelativeTimeString, useLocale } from '@automattic/i18n-utils';
import { useSmooch } from '@automattic/zendesk-client';
import { TabPanel, Card } from '@wordpress/components';
import { chevronRight, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';

import './help-center-chat-history.scss';

export const HelpCenterChatHistory = () => {
	const { __ } = useI18n();
	const locale = useLocale();

	const TAB_STATES = {
		recent: 'recent',
		archived: 'archived',
	};

	const [ activeTab, setActiveTab ] = useState( TAB_STATES.recent );
	const [ conversations, setConversations ] = useState( [] );
	const { init, getConversations } = useSmooch();

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
				onSelect={ ( tabName ) => {
					setActiveTab( tabName );
				} }
			>
				{ () =>
					conversations.map( ( conversation ) => {
						const message = conversation.messages[ 0 ];

						return (
							<Card key={ conversation.id } className="help-center-chat-history__conversation-card">
								<div className="help-center-chat-history__conversation-avatar">
									<img src={ message.avatarUrl } alt={ __( 'User Avatar' ) } />
								</div>
								<div className="help-center-chat-history__conversation-information">
									<div>{ message.text }</div>
									<div className="help-center-chat-history__conversation-sub-information">
										<span className="help-center-chat-history__conversation-information-name">
											{ message.displayName }
										</span>

										<span>
											{ getRelativeTimeString( {
												timestamp: message.received * 1000,
												locale,
												style: 'long',
											} ) }
										</span>
									</div>
								</div>
								<div className="help-center-chat-history__open-conversation">
									<Icon icon={ chevronRight } size={ 24 } />
								</div>
							</Card>
						);
					} )
				}
			</TabPanel>
		</div>
	);
};
